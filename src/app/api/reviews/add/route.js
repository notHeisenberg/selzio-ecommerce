import { NextResponse } from 'next/server';
import { getReviewsCollection, getProductsCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

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
    const reviewText = formData.get('reviewText');
    const imageFile = formData.get('image');
    
    // Validate required fields
    if (!productId || !productCode || !rating || !name || !reviewText) {
      return NextResponse.json(
        { message: 'Missing required fields' },
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
      productId,
      productCode,
      rating,
      name,
      email,
      text: reviewText,
      verified: !!session, // Mark as verified if user is logged in
      date: new Date(),
    };

    // Handle image upload if provided
    if (imageFile) {
      try {
        // Convert file to base64 for Cloudinary upload
        const fileBuffer = await imageFile.arrayBuffer();
        const base64File = Buffer.from(fileBuffer).toString('base64');
        const base64DataUrl = `data:${imageFile.type};base64,${base64File}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64DataUrl, {
          folder: 'product-reviews',
        });
        
        // Add image URL to review
        review.image = result.secure_url;
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue without image if upload fails
      }
    }

    // Get MongoDB collections
    const reviewsCollection = await getReviewsCollection();
    const productsCollection = await getProductsCollection();
    
    // Insert review into database
    await reviewsCollection.insertOne(review);
    
    // Update product's average rating
    const allProductReviews = await reviewsCollection
      .find({ productCode })
      .toArray();
    
    const averageRating = 
      allProductReviews.reduce((acc, curr) => acc + curr.rating, 0) / 
      allProductReviews.length;
    
    // Update product with new average rating and review count
    await productsCollection.updateOne(
      { productCode },
      { 
        $set: { 
          rating: parseFloat(averageRating.toFixed(1)),
          reviews: allProductReviews.length 
        } 
      }
    );
    
    return NextResponse.json(
      { message: 'Review submitted successfully' },
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