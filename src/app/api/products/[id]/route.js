import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';
import { requireAdmin } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

// GET a single product by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    // Find product by ID
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE a product
export async function PUT(req, { params }) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const { id } = params;
    const body = await req.json();
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    // Add updated timestamp and modifier info
    const updatedProduct = {
      ...body,
      updatedBy: user.id,
      updatedAt: new Date()
    };

    // Update product
    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedProduct },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(req, { params }) {
  try {
    // Verify that the user is authenticated and is an admin
    const user = await requireAdmin(req);
    if (user instanceof Response) {
      return user; // Return the error response
    }

    const { id } = params;
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    // Delete product
    const result = await productsCollection.findOneAndDelete({ _id: new ObjectId(id) });
    
    if (!result) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 