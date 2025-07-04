import { NextResponse } from 'next/server';
import { getCombosCollection } from '@/lib/mongodb';
import { requireAuth, requireAdmin } from '@/middleware/auth';

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

    // Execute query
    const skip = (page - 1) * limit;
    const total = await combosCollection.countDocuments(query);
    const combos = await combosCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      combos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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