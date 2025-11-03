import { NextResponse } from 'next/server';
import { getReviewsCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';
import { calculateAndUpdateProductRating } from '@/utils/ratingUtils';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Get session to check if user is authenticated (optional)
    const session = await getServerSession(authOptions);
    
    // Parse form data
    const formData = await request.formData();
    
    const productId = formData.get('productId');
    const productCode = formData.get('productCode');
    const rating = parseInt(formData.get('rating'));
    const name = formData.get('name');
    const email = formData.get('email') || '';
    const reviewText = formData.get('reviewText') || formData.get('text'); // Support both field names
    const imageFile = formData.get('image');
    const isGeneralTestimonial = formData.get('isGeneralTestimonial') === 'true';
    
    // Validate required fields
    // For general testimonials, productId and productCode are optional
    if (!rating || !name || !reviewText) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // For product reviews, productId and productCode are required
    if (!isGeneralTestimonial && (!productId || !productCode)) {
      return NextResponse.json(
        { message: 'Product information is required for product reviews' },
        { status: 400 }
      );
    }

    // Validate rating
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Initialize review object
    const review = {
      rating,
      name,
      email,
      text: reviewText,
      verified: !!session, // Mark as verified if user is logged in
      date: new Date(),
      createdAt: new Date(),
    };
    
    // Add product info for product reviews
    if (!isGeneralTestimonial && productId && productCode) {
      review.productId = productId;
      review.productCode = productCode;
    } else {
      // Mark as general testimonial
      review.isGeneralTestimonial = true;
    }

    // Handle image upload if provided
    if (imageFile) {
      try {
        // Convert file to base64 for Cloudinary upload
        const fileBuffer = await imageFile.arrayBuffer();
        const base64File = Buffer.from(fileBuffer).toString('base64');
        const base64DataUrl = `data:${imageFile.type};base64,${base64File}`;
        
        // Upload to Cloudinary
        const folderName = isGeneralTestimonial ? 'testimonials' : 'product-reviews';
        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: folderName,
        });
        
        // Add image URL to review
        review.image = result.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue without image if upload fails
      }
    }

    // Get MongoDB collection
    const reviewsCollection = await getReviewsCollection();
    
    // Insert review into database
    const result = await reviewsCollection.insertOne(review);
    
    // Update product's average rating only for product reviews
    if (!isGeneralTestimonial && productCode) {
      await calculateAndUpdateProductRating(productCode);
    }
    
    const successMessage = isGeneralTestimonial 
      ? 'Testimonial submitted successfully' 
      : 'Review submitted successfully';
    
    return NextResponse.json(
      { 
        message: successMessage,
        reviewId: result.insertedId.toString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 