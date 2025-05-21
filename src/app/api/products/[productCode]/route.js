import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';
import { requireAdmin } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export async function GET(req, { params }) {
  try {
    const { productCode } = params;

    if (!productCode) {
      return NextResponse.json(
        { error: 'Product identifier is required' },
        { status: 400 }
      );
    }

    // Get products collection
    const productsCollection = await getProductsCollection();

    let product;
    
    // First try to find by productCode
    product = await productsCollection.findOne({ productCode });

    // If not found and it could be a valid MongoDB ID, try finding by _id
    if (!product && ObjectId.isValid(productCode)) {
      product = await productsCollection.findOne({ _id: new ObjectId(productCode) });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
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

    const { productCode } = params;
    const body = await req.json();
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    // Add updated timestamp and modifier info
    const updatedProduct = {
      ...body,
      updatedBy: user.id,
      updatedAt: new Date()
    };

    let result;
    
    // Try to update by productCode first
    result = await productsCollection.findOneAndUpdate(
      { productCode },
      { $set: updatedProduct },
      { returnDocument: 'after' }
    );

    // If not found and it could be a valid MongoDB ID, try updating by _id
    if (!result && ObjectId.isValid(productCode)) {
      result = await productsCollection.findOneAndUpdate(
        { _id: new ObjectId(productCode) },
        { $set: updatedProduct },
        { returnDocument: 'after' }
      );
    }

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

    const { productCode } = params;
    
    // Get products collection
    const productsCollection = await getProductsCollection();

    let result;
    
    // Try to delete by productCode first
    result = await productsCollection.findOneAndDelete({ productCode });

    // If not found and it could be a valid MongoDB ID, try deleting by _id
    if (!result && ObjectId.isValid(productCode)) {
      result = await productsCollection.findOneAndDelete({ _id: new ObjectId(productCode) });
    }
    
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