import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';
import { requireAuth, requireAdmin } from '@/middleware/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const topSelling = searchParams.get('topSelling');

    // Get products collection
    const productsCollection = await getProductsCollection();

    // Build query
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (topSelling === 'true') query.topSelling = true;

    // Find products with pagination
    const products = await productsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    // Count total matching documents
    const total = await productsCollection.countDocuments(query);

    return NextResponse.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
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