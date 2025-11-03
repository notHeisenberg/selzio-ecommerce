import { NextResponse } from 'next/server';
import { getOrdersCollection, getProductsCollection, getUsersCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getAuthUser } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

// Force this route to be dynamic and never cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('Unauthorized access to admin stats API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('Unauthorized access to admin stats API - authenticated but no user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch full user data from database to check admin role properly
    let isAdmin = false;
    
    try {
      const usersCollection = await getUsersCollection();
      const userId = user.id || user._id;
      
      if (userId) {
        // Convert to ObjectId if it's a valid string
        let userObjectId = userId;
        if (typeof userId === 'string' && ObjectId.isValid(userId)) {
          userObjectId = new ObjectId(userId);
        }
        
        const fullUser = await usersCollection.findOne({ _id: userObjectId });
        
        if (fullUser) {
          // Check admin role from database
          isAdmin = fullUser.role === 'admin';
          console.log('🔍 Admin stats - User role check:', { 
            userId: fullUser._id.toString(), 
            role: fullUser.role, 
            isAdmin 
          });
        } else {
          console.error('🔴 User not found in database for admin stats:', userId);
        }
      }
    } catch (error) {
      console.error('🔴 Error fetching user for admin check:', error);
      // Fallback to token-based check
      isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    }
    
    if (!isAdmin) {
      console.error('🔴 Non-admin user attempting to access admin stats:', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all collections
    const ordersCollection = await getOrdersCollection();
    const productsCollection = await getProductsCollection();
    const usersCollection = await getUsersCollection();

    // Get statistics
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      orderStats,
      revenueStats
    ] = await Promise.all([
      // Total orders count
      ordersCollection.countDocuments(),
      
      // Total products count
      productsCollection.countDocuments(),
      
      // Total users count
      usersCollection.countDocuments(),
      
      // Order status breakdown
      ordersCollection.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Revenue statistics
      ordersCollection.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ]).toArray()
    ]);

    // Format order status data
    const orderStatusMap = {};
    orderStats.forEach(stat => {
      orderStatusMap[stat._id] = stat.count;
    });

    // Get revenue data
    const revenueData = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 };

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await ordersCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get low stock products
    const lowStockProducts = await productsCollection.countDocuments({
      $or: [
        { stock: { $eq: 0 } },
        { stock: { $lt: 10, $gt: 0 } }
      ]
    });

    const stats = {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueData.totalRevenue || 0,
      avgOrderValue: revenueData.avgOrderValue || 0,
      recentOrders,
      lowStockProducts,
      ordersByStatus: {
        pending: orderStatusMap.pending || 0,
        processing: orderStatusMap.processing || 0,
        delivered: orderStatusMap.delivered || 0,
        cancelled: orderStatusMap.cancelled || 0,
        cancellation_requested: orderStatusMap.cancellation_requested || 0,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
