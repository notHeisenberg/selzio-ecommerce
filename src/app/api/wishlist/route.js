import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getWishlistCollection, getProductsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/wishlist - Get user's wishlist
export async function GET(request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get the wishlist collection
    const wishlistCollection = await getWishlistCollection();
    
    // Find the user's wishlist document
    const userWishlist = await wishlistCollection.findOne({ userId });
    
    // If no wishlist or empty items, return empty array
    if (!userWishlist || !userWishlist.items || userWishlist.items.length === 0) {
      return NextResponse.json({ 
        success: true,
        wishlist: [] 
      });
    }
    
    // Check if we need to fetch any products
    const missingInfoItems = userWishlist.items.filter(item => !item.name);
    
    // If some items don't have product info, fetch them from products collection
    if (missingInfoItems.length > 0) {
      const productIds = missingInfoItems.map(item => {
        try {
          return new ObjectId(item.productId);
        } catch (e) {
          // If not a valid ObjectId, return as is (string)
          return item.productId;
        }
      });
      
      // Fetch product details
      if (productIds.length > 0) {
        const productsCollection = await getProductsCollection();
        const products = await productsCollection.find({ 
          $or: [
            { _id: { $in: productIds.filter(id => id instanceof ObjectId) } },
            { id: { $in: productIds.filter(id => !(id instanceof ObjectId)) } }
          ] 
        }).toArray();
        
        // Update wishlist items with product data
        for (const product of products) {
          const productId = product._id?.toString() || product.id;
          
          // Find the index of the item in the items array
          const itemIndex = userWishlist.items.findIndex(
            item => item.productId === productId
          );
          
          if (itemIndex !== -1) {
            // Update the item with product data
            userWishlist.items[itemIndex] = {
              ...userWishlist.items[itemIndex],
              name: product.name,
              price: product.price,
              image: product.image || product.images?.[0] || '',
              category: product.category,
              subcategory: product.subcategory,
              stock: product.stock || 0,
              rating: product.rating,
              discount: product.discount
            };
            
            // Update the document in the database
            await wishlistCollection.updateOne(
              { userId, "items.productId": productId },
              { 
                $set: { 
                  [`items.$.name`]: product.name,
                  [`items.$.price`]: product.price,
                  [`items.$.image`]: product.image || product.images?.[0] || '',
                  [`items.$.category`]: product.category,
                  [`items.$.subcategory`]: product.subcategory,
                  [`items.$.stock`]: product.stock || 0,
                  [`items.$.rating`]: product.rating,
                  [`items.$.discount`]: product.discount
                } 
              }
            );
          }
        }
      }
    }
    
    // Map wishlist items to response format
    const wishlist = userWishlist.items.map(item => ({
      id: item.productId,
      productCode: item.productId,
      name: item.name || "Unknown Product",
      price: item.price || 0,
      image: item.image || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      stock: item.stock || 0,
      inStock: item.stock > 0,
      rating: item.rating || 0,
      discount: item.discount || 0,
      addedToWishlistAt: item.createdAt || new Date()
    }));

    return NextResponse.json({ 
      success: true,
      wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { productId, productData } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Get the wishlist collection
    const wishlistCollection = await getWishlistCollection();
    
    // If productData wasn't provided, try to fetch it from the database
    let productInfo = productData || {};
    if (!productData || Object.keys(productData).length === 0) {
      try {
        const productsCollection = await getProductsCollection();
        
        let idQuery;
        try {
          // Try to convert to ObjectId if it's in that format
          idQuery = { _id: new ObjectId(productId) };
        } catch (e) {
          // Otherwise use as string ID
          idQuery = { id: productId };
        }
        
        const product = await productsCollection.findOne(idQuery);
        
        if (product) {
          productInfo = {
            name: product.name,
            price: product.price,
            image: product.image || product.images?.[0] || '',
            category: product.category,
            subcategory: product.subcategory,
            stock: product.stock || 0,
            rating: product.rating,
            discount: product.discount
          };
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        // Continue even if product details can't be fetched
      }
    }
    
    // Find the user's wishlist document
    const userWishlist = await wishlistCollection.findOne({ userId });
    
    if (userWishlist) {
      // User already has a wishlist document
      // Check if product is already in the wishlist
      if (userWishlist.items.some(item => item.productId === productId)) {
        return NextResponse.json({
          success: true,
          message: 'Product already in wishlist'
        });
      }
      
      // Add the new product to the wishlist array
      await wishlistCollection.updateOne(
        { userId },
        { 
          $push: { 
            items: { 
              productId, 
              createdAt: new Date(),
              ...productInfo
            } 
          } 
        }
      );
    } else {
      // Create a new wishlist document for the user
      await wishlistCollection.insertOne({
        userId,
        items: [{ 
          productId, 
          createdAt: new Date(),
          ...productInfo
        }]
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get product ID from query parameters
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    // Get the wishlist collection
    const wishlistCollection = await getWishlistCollection();
    
    // Find the user's wishlist document
    const userWishlist = await wishlistCollection.findOne({ userId });
    
    // If no wishlist found, return error
    if (!userWishlist) {
      return NextResponse.json({
        success: false,
        message: 'Wishlist not found'
      }, { status: 404 });
    }
    
    // Check if product exists in wishlist
    const productExists = userWishlist.items.some(item => item.productId === productId);
    
    if (!productExists) {
      return NextResponse.json({
        success: false,
        message: 'Product not found in wishlist'
      }, { status: 404 });
    }
    
    // Remove the item from the wishlist array
    const result = await wishlistCollection.updateOne(
      { userId },
      { $pull: { items: { productId } } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to remove product from wishlist'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
} 