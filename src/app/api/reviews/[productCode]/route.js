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
    
    // Execute all queries in parallel for maximum speed
    const [reviews, totalReviews, ratingDistribution] = await Promise.all([
      // Get reviews with pagination and field projection
      reviewsCollection
        .find(query, {
          projection: {
            name: 1,
            rating: 1,
            text: 1,
            image: 1,
            verified: 1,
            date: 1,
            productCode: 1,
            createdAt: 1
          }
        })
        .sort({ createdAt: -1, rating: -1 }) // Use indexed sort
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      
      // Get total count
      reviewsCollection.countDocuments(query),
      
      // Get rating distribution (optimized)
      reviewsCollection
        .aggregate([
          { $match: { productCode } },
          { 
            $group: { 
              _id: '$rating', 
              count: { $sum: 1 } 
            } 
          },
          { $sort: { _id: -1 } }
        ])
        .toArray()
    ]);
    
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
    
    const response = NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        currentPage: page,
        limit
      },
      ratingDistribution: formattedDistribution
    });

    // Add caching headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=300' // 1 min cache, 5 min stale
    );
    response.headers.set('CDN-Cache-Control', 'max-age=120');
    
    return response;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 