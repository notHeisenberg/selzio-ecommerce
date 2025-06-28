import { NextResponse } from 'next/server';
import { getDatabase, getReviewsCollection } from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { productCode } = params;
    
    if (!productCode) {
      return NextResponse.json(
        { message: 'Product code is required' },
        { status: 400 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    const page = parseInt(searchParams.get('page') || '1');
    const ratingFilter = searchParams.get('rating');
    
    // Get MongoDB collection
    const reviewsCollection = await getReviewsCollection();
    
    // Build query
    const query = { productCode };
    
    // Apply rating filter if provided
    if (ratingFilter && !isNaN(parseInt(ratingFilter))) {
      query.rating = parseInt(ratingFilter);
    }
    
    // Get reviews with pagination
    const reviews = await reviewsCollection
      .find(query)
      .sort({ date: -1 }) // Most recent first
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Get total count for pagination
    const totalReviews = await reviewsCollection
      .countDocuments(query);
    
    // Get rating distribution
    const ratingDistribution = await reviewsCollection
      .aggregate([
        { $match: { productCode } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ])
      .toArray();
    
    // Format rating distribution
    const formattedDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = 5 - i;
      const found = ratingDistribution.find(item => item._id === rating);
      return {
        rating,
        count: found ? found.count : 0,
        percentage: totalReviews > 0 
          ? Math.round((found ? found.count : 0) / totalReviews * 100) 
          : 0
      };
    });
    
    return NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        currentPage: page,
        limit
      },
      ratingDistribution: formattedDistribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 