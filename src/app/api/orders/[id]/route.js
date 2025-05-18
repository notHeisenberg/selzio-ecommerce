import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getOrdersCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getAuthUser } from '@/lib/jwt';

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

    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({ _id: new ObjectId(params.id) });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has permission to view this order
    const isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    
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

    // Only admins can update orders
    const isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    
    if (!isAdmin) {
      console.error('🔴 User is not admin', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Verify ObjectId is valid
    if (!ObjectId.isValid(params.id)) {
      console.error('🔴 Invalid ObjectId:', params.id);
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const ordersCollection = await getOrdersCollection();
    
    // Check if this is a status update request - now we handle it directly
    if (updateData.status) {
      
      // Find the order first to validate it exists
      const order = await ordersCollection.findOne({ _id: new ObjectId(params.id) });
      if (!order) {
        console.error('🔴 Order not found for status update with ID:', params.id);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      // Update the status
      const result = await ordersCollection.findOneAndUpdate(
        { _id: new ObjectId(params.id) },
        { 
          $set: { 
            status: updateData.status,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      if (!result) {
        console.error('🔴 Failed to update order status');
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true,
        message: 'Order status updated successfully',
        order: result
      });
    }

    // If not a status update, process other fields
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      console.error('🔴 Order not found with ID:', params.id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      order: result,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('🔴 Unhandled error in PUT handler:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}

// DELETE an order
export async function DELETE(req, { params }) {
  try {
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('Unauthorized access to delete order API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('Unauthorized access to delete order API - authenticated but no user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({ _id: new ObjectId(params.id) });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user has permission to delete this order
    const isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    
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
      
      // Compare the string representations
      if (sessionUserIdStr !== orderUserIdStr) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending orders can be deleted' },
        { status: 400 }
      );
    }

    await ordersCollection.deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 