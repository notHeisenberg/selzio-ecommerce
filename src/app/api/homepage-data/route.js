import { NextResponse } from 'next/server';
import { getProductsCollection, getCombosCollection, getReviewsCollection } from '@/lib/mongodb';
import { unstable_cache } from 'next/cache';

/**
 * Optimized endpoint specifically for homepage data
 * Returns only the minimal data needed for homepage in a single request
 * Includes: products, categories, combos, and testimonials (reviews)
 */
export async function GET(req) {
  try {
    const productsCollection = await getProductsCollection();
    const combosCollection = await getCombosCollection();
    const reviewsCollection = await getReviewsCollection();

    // Execute all queries in parallel for maximum speed
    const [
      topSellingProducts,
      featuredCategoryProducts,
      featuredCombos,
      testimonials
    ] = await Promise.all([
      // Get only top 4 selling products with minimal fields
      // Using index: topSelling_1_createdAt_-1
      productsCollection
        .find(
          { topSelling: true },
          { 
            projection: {
              productCode: 1,
              name: 1,
              price: 1,
              originalPrice: 1,
              discount: 1,
              image: 1,
              images: 1,
              stock: 1,
              topSelling: 1,
              category: 1,
              subcategory: 1,
              featured: 1
            }
          }
        )
        .sort({ topSelling: -1, createdAt: -1 }) // Index-optimized sort
        .limit(4)
        .toArray(),

      // Get products for featured categories (minimal fields)
      productsCollection
        .find(
          {},
          {
            projection: {
              subcategory: 1,
              category: 1,
              discount: 1
            }
          }
        )
        .limit(50) // Only fetch enough to build featured categories
        .toArray(),

      // Get featured combos (limit to 3)
      // Using index: featured_1_createdAt_-1
      combosCollection
        .find(
          { featured: true },
          {
            projection: {
              comboCode: 1,
              name: 1,
              description: 1,
              price: 1,
              originalPrice: 1,
              discount: 1,
              image: 1,
              images: 1,
              products: 1,
              featured: 1
            }
          }
        )
        .sort({ featured: -1, createdAt: -1 }) // Index-optimized sort
        .limit(3)
        .toArray(),

      // Get high-rated reviews for testimonials (4-5 stars, includes both product reviews and general testimonials)
      // Using index: rating_1_createdAt_-1
      reviewsCollection
        .find(
          { 
            rating: { $gte: 4 }, // Only 4 and 5 star reviews
            text: { $exists: true, $ne: "" } // Must have text
          },
          {
            projection: {
              name: 1,
              rating: 1,
              text: 1,
              image: 1,
              verified: 1,
              date: 1,
              productCode: 1,
              createdAt: 1,
              isGeneralTestimonial: 1
            }
          }
        )
        .sort({ rating: -1, createdAt: -1 }) // Index-optimized sort
        .limit(12) // Get 12 for testimonials carousel
        .toArray()
    ]);

    // Build featured categories from products
    const subcategoryMap = new Map();
    featuredCategoryProducts.forEach(product => {
      if (product.subcategory) {
        const key = product.subcategory;
        if (!subcategoryMap.has(key)) {
          subcategoryMap.set(key, {
            subcategory: product.subcategory,
            category: product.category,
            maxDiscount: product.discount || 0,
            count: 0
          });
        } else {
          const existing = subcategoryMap.get(key);
          existing.maxDiscount = Math.max(existing.maxDiscount, product.discount || 0);
        }
        subcategoryMap.get(key).count++;
      }
    });

    const featuredCategories = Array.from(subcategoryMap.values())
      .slice(0, 2) // Only return 2 for homepage
      .map((item, index) => ({
        id: index + 1,
        name: item.subcategory,
        category: item.category,
        count: item.count,
        discount: Math.min(Math.round(item.maxDiscount / 5) * 5, 50)
      }));

    // Format testimonials
    const formattedTestimonials = testimonials.map(review => ({
      id: review._id.toString(),
      name: review.name,
      role: review.verified ? "Verified Buyer" : "Customer",
      verified: review.verified || false,
      date: review.date ? new Date(review.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      image: review.image || null,
      rating: review.rating,
      text: review.text,
      productCode: review.productCode
    }));

    // Prepare response
    const response = NextResponse.json({
      topSellingProducts,
      featuredCategories,
      featuredCombos,
      testimonials: formattedTestimonials,
      timestamp: Date.now()
    });

    // Aggressive caching headers
    response.headers.set(
      'Cache-Control', 
      'public, max-age=60, stale-while-revalidate=120' // 1 min cache, 2 min stale
    );
    response.headers.set('CDN-Cache-Control', 'max-age=60');
    response.headers.set('Vary', 'Accept-Encoding');

    return response;
  } catch (error) {
    console.error('Homepage data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}

// Enable edge runtime for faster response times
export const runtime = 'nodejs'; // Use 'edge' if your MongoDB driver supports it
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Always fetch fresh data, rely on revalidateTag for cache busting

