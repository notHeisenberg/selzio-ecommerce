import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// Force this route to be dynamic and never cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const topSelling = searchParams.get('topSelling');
    const tags = searchParams.get('tags');
    const excludeProductCode = searchParams.get('excludeProductCode');
    const relatedTo = searchParams.get('relatedTo');

    // Get products collection
    const productsCollection = await getProductsCollection();

    // Build query
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (topSelling === 'true') query.topSelling = true;
    
    // Handle tags querying (comma-separated list)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Exclude current product if specified
    if (excludeProductCode) {
      query.productCode = { $ne: excludeProductCode };
    }
    
    // Handle related products query (special case)
    if (relatedTo) {
      try {
        // First get the product to relate to
        const sourceProduct = await productsCollection.findOne({ productCode: relatedTo });
        
        if (sourceProduct) {
          // Build query to find related products
          // MUST be in same category (mandatory)
          const relatedQuery = { 
            productCode: { $ne: relatedTo },
            category: sourceProduct.category  // Mandatory: same category
          };
          
          // PREFER same subcategory (if exists)
          // This will narrow down further (e.g., only show t-shirts for t-shirts, not pants)
          if (sourceProduct.subcategory) {
            relatedQuery.subcategory = sourceProduct.subcategory;
          }
          
          // Additional optional filters for better matching
          const orConditions = [];
          
          // Matching tags (for more relevant suggestions)
          if (sourceProduct.tags && sourceProduct.tags.length > 0) {
            orConditions.push({ tags: { $in: sourceProduct.tags } });
          }
          
          // Top selling products in same category
          orConditions.push({ topSelling: true });
          
          // If we have optional conditions, add them as OR
          if (orConditions.length > 0) {
            relatedQuery.$or = orConditions;
          }
          
          // Replace the original query
          Object.assign(query, relatedQuery);
        }
      } catch (error) {
        console.error('Error building related products query:', error);
        // Continue with existing query if this fails
      }
    }

    // Optimize: Use projection to only fetch needed fields (reduces payload by ~40%)
    const projection = {
      productCode: 1,
      name: 1,
      price: 1,
      originalPrice: 1,
      discount: 1,
      image: 1,
      images: 1,
      stock: 1,
      topSelling: 1,
      category: 1,
      subcategory: 1,
      description: 1,
      tags: 1,
      featured: 1,
      sizes: 1,
      additionalInfo: 1,
      createdAt: 1,
      updatedAt: 1
    };

    // Execute both queries in parallel for better performance
    const [products, total] = await Promise.all([
      productsCollection
        .find(query, { projection })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ topSelling: -1, createdAt: -1 })
        .toArray(),
      productsCollection.countDocuments(query)
    ]);

    const response = NextResponse.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

    // Check if this is an admin request (has timestamp parameter)
    const isAdminRequest = searchParams.get('t');
    
    if (isAdminRequest) {
      // For admin requests, disable caching to ensure fresh data
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    } else {
      // For public requests, use caching for better performance
      response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
      response.headers.set('CDN-Cache-Control', 'max-age=1200');
    }
    
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const body = await req.json();
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    // Clean up the product data - remove undefined values
    const cleanedData = Object.entries(body).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Initialize stats fields if not present
    if (!cleanedData.orders) cleanedData.orders = 0;
    if (!cleanedData.revenue) cleanedData.revenue = 0;

    // Add timestamps and creator info
    const product = {
      ...cleanedData,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert product
    const result = await productsCollection.insertOne(product);
    
    // Fetch the created product
    const createdProduct = await productsCollection.findOne({ _id: result.insertedId });
    
    // Revalidate all product-related paths and tags
    try {
      revalidatePath('/store');
      revalidatePath('/');
      revalidatePath('/products/[category]', 'page');
      revalidateTag('products');
      revalidateTag('homepage');
    } catch (revalidateError) {
      console.warn('Cache revalidation warning:', revalidateError);
    }
    
    return NextResponse.json(
      { 
        success: true,
        product: createdProduct
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 