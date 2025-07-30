import { getReviewsCollection, getProductsCollection } from './mongodb';

/**
 * Calculate average rating for a specific product from its reviews
 * @param {string} productCode - The product code to calculate rating for
 * @returns {Promise<{rating: number, reviewCount: number}>}
 */
export async function calculateProductRating(productCode) {
  try {
    const reviewsCollection = await getReviewsCollection();
    
    // Get all reviews for this product
    const reviews = await reviewsCollection
      .find({ productCode })
      .toArray();
    
    if (reviews.length === 0) {
      return { rating: 0, reviewCount: 0 };
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    return {
      rating: parseFloat(averageRating.toFixed(1)),
      reviewCount: reviews.length
    };
  } catch (error) {
    console.error('Error calculating product rating:', error);
    return { rating: 0, reviewCount: 0 };
  }
}

/**
 * Update product rating in the database
 * @param {string} productCode - The product code to update
 * @returns {Promise<boolean>} - Success status
 */
export async function updateProductRating(productCode) {
  try {
    const { rating, reviewCount } = await calculateProductRating(productCode);
    const productsCollection = await getProductsCollection();
    
    await productsCollection.updateOne(
      { productCode },
      { 
        $set: { 
          rating: rating,
          reviews: reviewCount 
        } 
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating product rating:', error);
    return false;
  }
}

/**
 * Recalculate and update ratings for all products
 * This function can be used to ensure all product ratings are accurate
 * @returns {Promise<{updated: number, errors: number}>}
 */
export async function recalculateAllProductRatings() {
  try {
    const productsCollection = await getProductsCollection();
    const reviewsCollection = await getReviewsCollection();
    
    // Get all unique product codes from reviews
    const productCodes = await reviewsCollection.distinct('productCode');
    
    let updated = 0;
    let errors = 0;
    
    for (const productCode of productCodes) {
      try {
        const success = await updateProductRating(productCode);
        if (success) {
          updated++;
        } else {
          errors++;
        }
      } catch (error) {
        console.error(`Error updating rating for product ${productCode}:`, error);
        errors++;
      }
    }
    
    // Also set rating to 0 for products with no reviews
    await productsCollection.updateMany(
      { productCode: { $nin: productCodes } },
      { $set: { rating: 0, reviews: 0 } }
    );
    
    return { updated, errors };
  } catch (error) {
    console.error('Error recalculating all product ratings:', error);
    return { updated: 0, errors: 1 };
  }
}

/**
 * Get rating distribution for a product
 * @param {string} productCode - The product code
 * @returns {Promise<Array>} - Array of rating distribution objects
 */
export async function getProductRatingDistribution(productCode) {
  try {
    const reviewsCollection = await getReviewsCollection();
    
    // Get rating distribution using aggregation
    const distribution = await reviewsCollection
      .aggregate([
        { $match: { productCode } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ])
      .toArray();
    
    // Get total reviews count
    const totalReviews = await reviewsCollection.countDocuments({ productCode });
    
    // Format distribution for all ratings (1-5)
    const formattedDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const found = distribution.find(item => item._id === rating);
      const count = found ? found.count : 0;
      const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
      
      return {
        rating,
        count,
        percentage
      };
    });
    
    return formattedDistribution;
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    return [];
  }
}
