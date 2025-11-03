import { NextResponse } from 'next/server';
import { getCombosCollection } from '@/lib/mongodb';
import { requireAuth, requireAdmin } from '@/middleware/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// Force this route to be dynamic and never cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET combos
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const featured = searchParams.get('featured');
    const comboCode = searchParams.get('comboCode');

    // Get combos collection
    const combosCollection = await getCombosCollection();

    // Build query
    const query = {};
    if (featured === 'true') query.featured = true;
    if (comboCode) query.comboCode = comboCode;

    // Execute query with projection and parallel execution
    const skip = (page - 1) * limit;
    
    // Optimize: Only fetch needed fields
    const projection = {
      comboCode: 1,
      name: 1,
      description: 1,
      price: 1,
      originalPrice: 1,
      discount: 1,
      image: 1,
      images: 1,
      products: 1,
      featured: 1,
      createdAt: 1
    };
    
    // Execute both queries in parallel
    const [total, combos] = await Promise.all([
      combosCollection.countDocuments(query),
      combosCollection
        .find(query, { projection })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const response = NextResponse.json({
      combos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

    // Add proper caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=600, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'max-age=1200');
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;
  } catch (error) {
    console.error('Error fetching combos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new combo
export async function POST(req) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const body = await req.json();
    
    // Get combos collection
    const combosCollection = await getCombosCollection();

    // Generate a unique combo code
    const comboCode = 'CMB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Add timestamps, code and creator info
    const combo = {
      ...body,
      comboCode,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert combo
    const result = await combosCollection.insertOne(combo);
    
    // Revalidate all combo-related paths and tags
    try {
      revalidatePath('/combos');
      revalidatePath('/');
      revalidateTag('combos');
      revalidateTag('homepage');
    } catch (revalidateError) {
      console.warn('Cache revalidation warning:', revalidateError);
    }
    
    return NextResponse.json(
      { 
        ...combo,
        _id: result.insertedId 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Combo creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 