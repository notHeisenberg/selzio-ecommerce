import { getReviewsCollection, getProductsCollection } from '@/lib/mongodb';

/**
 * Calculate and update a product's rating based on its reviews
 * @param {string} productCode - The product code to update
 * @returns {Promise<{rating: number, reviewCount: number}>}
 */
export async function calculateAndUpdateProductRating(productCode) {
  try {
    const reviewsCollection = await getReviewsCollection();
    const productsCollection = await getProductsCollection();
    
    // Get all reviews for this product
    const productReviews = await reviewsCollection
      .find({ productCode })
      .toArray();
    
    let rating = 0;
    let reviewCount = productReviews.length;
    
    if (reviewCount > 0) {
      // Calculate average rating
      const averageRating = 
        productReviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount;
      rating = parseFloat(averageRating.toFixed(1));
    }
    
    // Update product with new rating and review count
    await productsCollection.updateOne(
      { productCode },
      { 
        $set: { 
          rating,
          reviews: reviewCount 
        } 
      }
    );
    
    return { rating, reviewCount };
  } catch (error) {
    console.error('Error calculating product rating:', error);
    throw error;
  }
}

/**
 * Get the average rating for a product
 * @param {Array} reviews - Array of review objects with rating property
 * @returns {number} Average rating rounded to 1 decimal place
 */
export function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  
  const total = reviews.reduce((acc, review) => acc + review.rating, 0);
  return parseFloat((total / reviews.length).toFixed(1));
}
