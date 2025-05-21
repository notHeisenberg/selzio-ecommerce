import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getWishlistCollection } from '@/lib/mongodb';

// DELETE /api/wishlist/clear - Clear all items from wishlist
export async function DELETE(request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get the wishlist collection
    const wishlistCollection = await getWishlistCollection();
    
    // Find the user's wishlist
    const userWishlist = await wishlistCollection.findOne({ userId });
    
    if (!userWishlist) {
      // If no wishlist exists, return success but with count 0
      return NextResponse.json({
        success: true,
        message: 'Wishlist already empty',
        deletedCount: 0
      });
    }
    
    // Update the user's wishlist with empty items array
    const result = await wishlistCollection.updateOne(
      { userId },
      { $set: { items: [] } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Wishlist cleared successfully',
      deletedCount: userWishlist.items?.length || 0
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
  }
} 