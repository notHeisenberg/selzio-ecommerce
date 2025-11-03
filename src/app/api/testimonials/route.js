import { NextResponse } from 'next/server';
import { getReviewsCollection } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get MongoDB collection
    const reviewsCollection = await getReviewsCollection();
    
    // Get all 4* and 5* reviews (both product reviews and general testimonials)
    const highRatedReviews = await reviewsCollection
      .find({ 
        rating: { $in: [4, 5] },
        // Only include reviews with text content
        text: { $exists: true, $ne: "" }
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Randomize and limit the results
    const shuffledReviews = highRatedReviews
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
    
    // Format reviews for testimonial display
    const testimonials = shuffledReviews.map((review, index) => ({
      id: review._id.toString(),
      name: review.name,
      role: review.verified ? "Verified Buyer" : "Customer",
      verified: review.verified || false,
      date: review.date ? new Date(review.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      image: review.image || null,
      rating: review.rating,
      text: review.text,
      productCode: review.productCode // Include product info for context
    }));
    
    return NextResponse.json({
      testimonials,
      total: highRatedReviews.length
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
