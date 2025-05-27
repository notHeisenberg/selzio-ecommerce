import { NextResponse } from 'next/server';
import { getProductsCollection } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code') || 'EL-WHPN';
    
    // Get products collection
    const productsCollection = await getProductsCollection();
    
    // Find product by code
    const product = await productsCollection.findOne({ productCode: code });
    
    // Check if we found anything
    if (!product) {
      // Search for any products to check if collection is working
      const sampleProducts = await productsCollection
        .find({})
        .limit(3)
        .toArray();
        
      return NextResponse.json({
        message: `Product with code '${code}' not found`,
        productFound: false,
        sampleProducts: sampleProducts.map(p => ({
          productCode: p.productCode,
          name: p.name,
          category: p.category,
          subcategory: p.subcategory || null
        }))
      });
    }
    
    return NextResponse.json({
      message: 'Product found',
      productFound: true,
      product
    });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 