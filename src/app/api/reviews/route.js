import { NextResponse } from 'next/server';
import { getReviewsCollection, getProductsCollection } from '@/lib/mongodb';
import { calculateAndUpdateProductRating } from '@/utils/ratingUtils';

export async function POST(request) {
  try {
    const { action } = await request.json();
    
    if (action === 'recalculate-all-ratings') {
      return await recalculateAllRatings();
    }
    
    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in reviews API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function recalculateAllRatings() {
  try {
    const reviewsCollection = await getReviewsCollection();
    const productsCollection = await getProductsCollection();
    
    // Get all unique product codes from reviews
    const productCodes = await reviewsCollection.distinct('productCode');
    
    let updatedCount = 0;
    
    // Update ratings for products with reviews using utility function
    for (const productCode of productCodes) {
      try {
        await calculateAndUpdateProductRating(productCode);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating rating for product ${productCode}:`, error);
      }
    }
    
    // Reset products without reviews to have 0 rating and 0 reviews
    const resetResult = await productsCollection.updateMany(
      { productCode: { $nin: productCodes } },
      { 
        $set: { 
          rating: 0,
          reviews: 0 
        } 
      }
    );
    
    return NextResponse.json({
      message: 'All product ratings recalculated successfully',
      updatedProducts: updatedCount,
      totalProductsWithReviews: productCodes.length,
      productsResetToZero: resetResult.modifiedCount
    });
  } catch (error) {
    console.error('Error recalculating ratings:', error);
    throw error;
  }
}
