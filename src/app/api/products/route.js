import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';
import { requireAuth, requireAdmin } from '@/middleware/auth';

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
          // Clear any existing query and build a new one
          // We'll use an $or query to match by different criteria
          const relatedQuery = { productCode: { $ne: relatedTo } };
          const orConditions = [];
          
          // Priority 1: Top selling products
          if (topSelling !== 'false') {
            orConditions.push({ topSelling: true });
          }
          
          // Priority 2: Same category/subcategory
          if (sourceProduct.category) {
            orConditions.push({ category: sourceProduct.category });
          }
          
          if (sourceProduct.subcategory) {
            orConditions.push({ subcategory: sourceProduct.subcategory });
          }
          
          // Priority 3: Matching tags
          if (sourceProduct.tags && sourceProduct.tags.length > 0) {
            orConditions.push({ tags: { $in: sourceProduct.tags } });
          }
          
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
      createdAt: 1
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

    // Add proper caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'max-age=1200');
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

    // Add timestamps and creator info
    const product = {
      ...body,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert product
    const result = await productsCollection.insertOne(product);
    
    return NextResponse.json(
      { 
        ...product,
        _id: result.insertedId 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 