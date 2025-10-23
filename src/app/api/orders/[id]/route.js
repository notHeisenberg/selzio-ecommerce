import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getOrdersCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getAuthUser } from '@/lib/jwt';
import { updateProductStats } from '@/utils/productUtils';

// GET a single order by ID
export async function GET(req, { params }) {
  try {
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('Unauthorized access to single order API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('Unauthorized access to single order API - authenticated but no user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
        }
      }
    } catch (error) {
      console.error('Error fetching user for admin check:', error);
      // Fallback to token-based check
      isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    }
    
    if (!isAdmin) {
      const sessionUserId = user.id || user._id;
      let orderUserId = order.user;
      
      // Convert both to strings for comparison
      const sessionUserIdStr = sessionUserId.toString();
      let orderUserIdStr = orderUserId;
      
      // Handle ObjectId conversion if needed
      if (orderUserId instanceof ObjectId) {
        orderUserIdStr = orderUserId.toString();
      }
      
      console.log('Comparing user IDs:', { 
        sessionUserIdStr, 
        orderUserIdStr, 
        match: sessionUserIdStr === orderUserIdStr 
      });
      
      // Compare the string representations
      if (sessionUserIdStr !== orderUserIdStr) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // If admin, include user details with the order
    if (isAdmin && order.user) {
      const usersCollection = await getUsersCollection();
      
      // Get userId in appropriate format
      let userId = order.user;
      if (userId instanceof ObjectId) {
        userId = userId;
      } else if (typeof userId === 'string' && ObjectId.isValid(userId)) {
        userId = new ObjectId(userId);
      }
      
      // Fetch user details
      const userData = await usersCollection.findOne(
        { _id: userId },
        { projection: { name: 1, email: 1, role: 1, phone: 1 } }
      );
      
      if (userData) {
        // Replace user ID with user object
        order.user = {
          id: userId.toString(),
          ...userData,
          _id: userData._id.toString() // Ensure _id is a string
        };
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE an order
export async function PUT(req, { params }) {
  try {
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req); 
    
    // Add detailed debugging for auth issues
    console.log('🔍 Auth debug info:', { 
      hasSession: !!session,
      sessionUser: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isAdmin: session.user.role === 'admin' || session.user.isAdmin
      } : 'No session user',
      hasJwtUser: !!jwtUser,
      jwtUserDetails: jwtUser ? {
        id: jwtUser.id,
        email: jwtUser.email,
        role: jwtUser.role,
        isAdmin: jwtUser.role === 'admin' || jwtUser.isAdmin
      } : 'No JWT user'
    });
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('🔴 Unauthorized access to update order API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('🔴 Unauthorized access to update order API - authenticated but no user data');
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
          console.log('🔍 Full user data for admin check (PUT):', { 
            userId: fullUser._id.toString(), 
            role: fullUser.role, 
            isAdmin 
          });
        } else {
          console.error('🔴 User not found in database:', userId);
        }
      }
    } catch (error) {
      console.error('🔴 Error fetching user for admin check:', error);
      // Fallback to token-based check
      isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    }
    
    // More thorough check for admin status
    console.log('👤 Detailed user info for admin check:', {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      isAdmin: isAdmin,
      rawRole: JSON.stringify(user.role)
    });
    
    console.log('🔍 User permission check:', { 
      userId: user.id, 
      userRole: user.role, 
      isAdmin,
      requestedAction: 'Update Order',
      orderId: id
    });
    
    // Safely attempt to parse the request body
    let updateData;
    try {
      const bodyText = await req.text();
      console.log('💎 Raw request body:', bodyText);
      
      if (bodyText.trim()) {
        updateData = JSON.parse(bodyText);
        console.log('💎 Parsed update data:', updateData);
      } else {
        console.error('🔴 Empty request body');
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
    } catch (parseError) {
      console.error('🔴 Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: parseError.message 
      }, { status: 400 });
    }

    const { id } = await params;
    
    // Verify ObjectId is valid
    if (!ObjectId.isValid(id)) {
      console.error('🔴 Invalid ObjectId:', id);
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const ordersCollection = await getOrdersCollection();
    
    // Fetch the order first for validation
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      console.error('🔴 Order not found with ID:', id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Special case for handling cancellation responses from admin UI
    // Specifically check for the exact fields sent in handleCancellationResponse
    if (updateData.cancellationResponded === true && 
        updateData.cancellationApproved !== undefined &&
        updateData.cancellationRespondedAt && 
        updateData.status) {
      
      // Force an isAdmin check just for this operation
      if (!isAdmin) {
        console.error('🔴 Non-admin user trying to respond to cancellation request');
        return NextResponse.json({ error: 'Only admins can approve or reject cancellation requests' }, { status: 401 });
      }
      
      console.log('💎 Admin responding to cancellation request:', {
        orderId: id,
        status: updateData.status,
        approved: updateData.cancellationApproved
      });
      
      // Admin is responding to a cancellation request
      const updateFields = {
        status: updateData.status, // Should be either "cancelled" or "pending"
        cancellationResponded: true,
        cancellationApproved: updateData.cancellationApproved,
        cancellationRespondedAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await ordersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        console.error('🔴 Failed to update order for cancellation response');
        return NextResponse.json({ error: 'Failed to process cancellation response' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: updateData.cancellationApproved 
          ? 'Order cancellation approved successfully' 
          : 'Order cancellation rejected successfully',
        order: result
      });
    }
    
    // Check user's permission on this order for regular operations
    if (!isAdmin) {
      // Regular users can only update their own orders
      const orderUserId = order.user.toString();
      const requestUserId = user.id.toString();
      
      if (orderUserId !== requestUserId) {
        console.error('🔴 User trying to update someone else\'s order', 
          { orderId: id, orderUser: orderUserId, requestUser: requestUserId });
        return NextResponse.json({ error: 'You can only update your own orders' }, { status: 403 });
      }
    }
    
    // Handle cancellation requests from regular users
    if (!isAdmin && updateData.status === 'cancellation_requested' && updateData.cancellationReason) {
      console.log('💎 User requesting cancellation:', updateData.cancellationReason);
      
      // Check if order is within cancellation window (6 hours)
      const orderDate = new Date(order.createdAt);
      const cancellationDeadline = new Date(orderDate.getTime() + (6 * 60 * 60 * 1000)); // 6 hours in milliseconds
      const now = new Date();
      
      if (now > cancellationDeadline) {
        console.error('🔴 Cancellation window expired', 
          { orderId: id, orderDate, cancellationDeadline, now });
        return NextResponse.json({ 
          error: 'Cancellation window expired. You can only cancel orders within 6 hours of placing them.' 
        }, { status: 403 });
      }
      
      // Check if order is in a cancellable state
      if (order.status !== 'pending' && order.status !== 'processing') {
        console.error('🔴 Order not in cancellable state', { orderId: id, status: order.status });
        return NextResponse.json({ 
          error: 'This order cannot be cancelled in its current state' 
        }, { status: 400 });
      }
      
      // Check if a cancellation was already requested or responded to
      if (order.cancellationRequestedAt || order.cancellationResponded) {
        console.error('🔴 Cancellation already requested or responded to', { orderId: id });
        return NextResponse.json({ 
          error: 'You cannot submit another cancellation request for this order' 
        }, { status: 400 });
      }
      
      // Process the cancellation request
      const result = await ordersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status: 'cancellation_requested',
            cancellationReason: updateData.cancellationReason,
            cancellationRequestedAt: new Date(),
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        console.error('🔴 Failed to update order for cancellation request');
        return NextResponse.json({ error: 'Failed to process cancellation request' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Cancellation request submitted successfully',
        order: result
      });
    }
    
    // For regular status updates and other admin operations, require admin permissions
    if (!isAdmin && (updateData.status || updateData.adminNotes)) {
      console.error('🔴 Non-admin user trying to update status or admin notes', 
        { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Unauthorized operation' }, { status: 401 });
    }

    // If we get here, only allow admin updates for other fields
    if (isAdmin) {
      // Check if we're changing the order status to cancelled
      const oldStatus = order.status;
      const newStatus = updateData.status;
      
      // Handle product statistics reversal for cancelled orders
      if (newStatus === 'cancelled' && oldStatus !== 'cancelled' && order.items) {
        try {
          console.log('📉 Reversing product statistics for cancelled order:', id);
          await updateProductStats(order.items, 'subtract');
          console.log('✅ Product statistics reversed for cancellation');
        } catch (statsError) {
          console.error('❌ Error reversing product statistics:', statsError);
          // Continue with status update even if stats reversal fails
        }
      }
      
      // Handle product statistics addition for orders being restored from cancelled
      if (oldStatus === 'cancelled' && newStatus !== 'cancelled' && order.items) {
        try {
          console.log('📈 Restoring product statistics for uncancelled order:', id);
          await updateProductStats(order.items, 'add');
          console.log('✅ Product statistics restored for uncancellation');
        } catch (statsError) {
          console.error('❌ Error restoring product statistics:', statsError);
          // Continue with status update even if stats restoration fails
        }
      }
      
      const result = await ordersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            ...updateData,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        console.error('🔴 Failed to update order');
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true,
        order: result,
        message: updateData.status ? 'Order status updated successfully' : 'Order updated successfully'
      });
    }
    
    // If no case matched, reject the request
    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('🔴 Unhandled error in PUT handler:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE a single order by ID (admin only)
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('🔴 Unauthorized access to delete order API - no session or JWT token');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('🔴 Unauthorized access to delete order API - authenticated but no user data');
      return NextResponse.json({ error: 'User information required' }, { status: 401 });
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
          console.log('🔍 Full user data for admin check (DELETE individual):', { 
            userId: fullUser._id.toString(), 
            role: fullUser.role, 
            isAdmin 
          });
        } else {
          console.error('🔴 User not found in database:', userId);
        }
      }
    } catch (error) {
      console.error('🔴 Error fetching user for admin check:', error);
      // Fallback to token-based check
      isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    }
    
    if (!isAdmin) {
      console.error('🔴 Non-admin user attempting to delete order:', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Only administrators can delete orders' }, { status: 403 });
    }
    
    // Verify ObjectId is valid
    if (!ObjectId.isValid(id)) {
      console.error('🔴 Invalid ObjectId:', id);
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const ordersCollection = await getOrdersCollection();
    
    // First find the order to verify it exists
    const existingOrder = await ordersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!existingOrder) {
      console.error('🔴 Order not found with ID:', id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Delete the order
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 1) {
      console.log('✅ Order deleted successfully:', id);
      return NextResponse.json({ 
        success: true, 
        message: 'Order deleted successfully',
        orderId: id
      });
    } else {
      console.error('🔴 Failed to delete order:', id);
      return NextResponse.json({ 
        error: 'Failed to delete order' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('🔴 Unhandled error in DELETE handler:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
} 