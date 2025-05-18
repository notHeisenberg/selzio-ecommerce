import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getOrdersCollection, getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req) {
  try {
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('Unauthorized access to orders API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('Unauthorized access to orders API - authenticated but no user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add debugging for auth
    console.log('Orders API authenticated via:', session ? 'NextAuth session' : 'JWT token');

    // Check if user is admin for different behavior
    const isAdmin = user && (
      user.role === 'admin' || 
      user.isAdmin === true || 
      user.admin === true
    );
    
    // Get URL parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const userId = url.searchParams.get('userId');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const includeUsers = url.searchParams.get('includeUsers') === 'true';
    
    // Prepare query
    let query = {};
    
    // If not admin, only show user's own orders
    if (!isAdmin) {
      // Ensure we use the correct user ID field
      let userIdField = user.id || user._id;
      
      // Make sure it's a string for comparison
      if (userIdField instanceof ObjectId) {
        userIdField = userIdField.toString();
      }
      
      query.user = userIdField;
    } else if (userId && userId !== 'all') {
      // Admin filtering by user
      let userIdToFilter = userId;
      
      // Convert to ObjectId if it's a valid format
      if (ObjectId.isValid(userId)) {
        userIdToFilter = new ObjectId(userId);
      }
      
      query.user = userIdToFilter;
    }
    
    // Filter by status if specified
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Enhanced search functionality
    if (search && search.trim() && isAdmin) {
      const searchTerm = search.trim();
      
      // Step 1: First search the users collection for matching users
      const usersCollection = await getUsersCollection();
      
      console.log('Search term:', searchTerm);
      
      // Look for users matching the search term (name, email, phone)
      const userQuery = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      
      console.log('User search query:', JSON.stringify(userQuery));
      
      const matchingUsers = await usersCollection.find(userQuery).toArray();
      
      console.log(`Found ${matchingUsers.length} users matching search term: ${searchTerm}`);
      if (matchingUsers.length > 0) {
        console.log('Matching users:', matchingUsers.map(u => ({ id: u._id.toString(), name: u.name, email: u.email })));
      }
      
      // Step 2: Check if we need to search by order ID or user info
      if (matchingUsers.length > 0 || searchTerm.length >= 1) {
        const searchConditions = [];
        
        // Add orders from matching users
        if (matchingUsers.length > 0) {
          // Get user IDs in both string and ObjectId format to ensure we catch all references
          let userIds = [];
          
          matchingUsers.forEach(u => {
            // Add ObjectId version
            if (u._id instanceof ObjectId) {
              userIds.push(u._id);
            } else if (ObjectId.isValid(u._id.toString())) {
              userIds.push(new ObjectId(u._id.toString()));
            }
            
            // Add string version
            userIds.push(u._id.toString());
          });
          
          console.log('Searching for orders with user IDs:', userIds.map(id => id.toString()));
          
          // Create a user query that handles both ObjectId and string formats
          searchConditions.push({ user: { $in: userIds } });
        }
        
        // Search by full ObjectId if the search term is a valid ObjectId
        if (ObjectId.isValid(searchTerm)) {
          searchConditions.push({ _id: new ObjectId(searchTerm) });
        }
        
        // Search by order ID containing the search term
        // This is especially useful for searching by the last digits
        if (searchTerm.length >= 1) {
          // Get all orders first
          const ordersCollection = await getOrdersCollection();
          const allOrders = await ordersCollection.find({}, { projection: { _id: 1 } }).toArray();
          
          // Filter orders where ID contains the search term
          const matchingOrderIds = allOrders
            .filter(order => {
              const orderIdStr = order._id.toString();
              return orderIdStr.endsWith(searchTerm) || orderIdStr.includes(searchTerm);
            })
            .map(order => order._id);
          
          if (matchingOrderIds.length > 0) {
            searchConditions.push({ _id: { $in: matchingOrderIds } });
          }
        }
        
        // Search by order number if present
        searchConditions.push({ orderNumber: { $regex: searchTerm, $options: 'i' } });
        
        // Search by status
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment_verification', 'payment_done'];
        const matchingStatuses = statuses.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matchingStatuses.length > 0) {
          searchConditions.push({ status: { $in: matchingStatuses } });
        }
        
        // Add all search conditions to the query
        if (searchConditions.length > 0) {
          query.$or = searchConditions;
          console.log('Final search conditions:', JSON.stringify(query.$or));
        }
      }
    }
    
    // Log the query for debugging
    console.log('Orders API query:', JSON.stringify(query));
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const ordersCollection = await getOrdersCollection();
    
    // For debugging, log the query
    console.log('Orders fetch query:', JSON.stringify(query));
    
    // Get total count for pagination
    const total = await ordersCollection.countDocuments(query);
    
    // Get orders with pagination and sorting
    let orders = await ordersCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log('Found orders:', orders.length);
    
    // Check for orders with missing user field and log them
    const ordersWithMissingUser = orders.filter(order => !order.user).length;
    if (ordersWithMissingUser > 0) {
      console.log(`Warning: ${ordersWithMissingUser} orders have missing/null user field`);
    }
    
    // If admin, populate user details for each order
    if (isAdmin && orders.length > 0) {
      const usersCollection = await getUsersCollection();
      
      // Get unique user IDs from orders
      const uniqueUserIds = [...new Set(
        orders
          .filter(order => order.user) // Skip orders with missing user field
          .map(order => {
            // Ensure we have strings for comparison
            if (order.user instanceof ObjectId) {
              return order.user.toString();
            }
            return order.user;
          })
      )];
      
      // Fetch user details if there are user IDs
      if (uniqueUserIds.length > 0) {
        // Prepare query to find users
        const userQuery = {
          $or: uniqueUserIds.map(id => {
            if (ObjectId.isValid(id)) {
              return { _id: new ObjectId(id) };
            }
            return { _id: id };
          })
        };
        
        // Get user data
        const users = await usersCollection
          .find(userQuery)
          .project({ _id: 1, name: 1, email: 1, role: 1, phone: 1 })
          .toArray();
        
        // Create map for quick user lookup
        const userMap = new Map();
        users.forEach(user => {
          userMap.set(user._id.toString(), user);
        });
        
        // Attach user data to each order
        orders = orders.map(order => {
          if (order.user) {
            const userId = typeof order.user === 'object' ? 
              order.user.toString() : order.user;
            
            const userData = userMap.get(userId);
            if (userData) {
              return {
                ...order,
                user: {
                  id: userId,
                  ...userData,
                  _id: userData._id.toString() // Ensure _id is a string
                }
              };
            }
          }
          return order;
        });
      }
    }
    
    // For non-admin users, we'll enrich with product data if products array is in the order
    let usersWithOrders = [];
    
    // For admin users, also get the list of users with orders
    if (isAdmin && includeUsers) {
      const usersCollection = await getUsersCollection();
      
      // Get unique user IDs from all orders
      const uniqueUserIds = await ordersCollection
        .aggregate([
          { $group: { _id: "$user" } },
          { $match: { _id: { $ne: null } } }
        ])
        .toArray();
        
      const userIdList = uniqueUserIds.map(item => item._id);
      
      // Get user details
      if (userIdList.length > 0) {
        // Create a query to find users
        const userQuery = {
          $or: userIdList.map(id => {
            if (typeof id === 'string' && ObjectId.isValid(id)) {
              return { _id: new ObjectId(id) };
            }
            return { _id: id };
          })
        };
        
        usersWithOrders = await usersCollection
          .find(userQuery)
          .project({ _id: 1, name: 1, email: 1, role: 1, phone: 1 })
          .toArray();
      }
    }

    // Build response object
    const response = {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    // Include users list if requested (for admin)
    if (isAdmin && includeUsers) {
      response.users = usersWithOrders;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderData = await req.json();
    const ordersCollection = await getOrdersCollection();

    // Get user ID - store it consistently as a string to match existing orders
    const userId = session.user.id.toString();
    
    // Log the user ID we're using for the order
    console.log('Creating order for user:', userId);

    const order = {
      ...orderData,
      user: userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await ordersCollection.insertOne(order);
    order._id = result.insertedId;

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle saving admin notes
export async function PUT(req) {
  try {
    console.log('💎 PUT request received on /api/orders main endpoint');
    
    // Try to get session from NextAuth first
    const session = await getServerSession(authOptions);
    console.log('💎 Session:', session ? 'Found' : 'Not found');
    
    // Try JWT token from header as backup authentication method
    const jwtUser = getAuthUser(req);
    console.log('💎 JWT user:', jwtUser ? 'Found' : 'Not found');
    
    // No authentication at all
    if (!session && !jwtUser) {
      console.error('🔴 Unauthorized access to orders PUT API - no session or JWT token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Choose the authenticated user (prefer session, fallback to JWT)
    const user = session?.user || jwtUser;
    
    if (!user) {
      console.error('🔴 Unauthorized access to orders PUT API - authenticated but no user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins can update orders
    const isAdmin = user.role === 'admin' || user.isAdmin === true || user.admin === true;
    console.log('💎 Is admin:', isAdmin);
    
    if (!isAdmin) {
      console.error('🔴 User is not admin', { userId: user.id, role: user.role });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Safely parse request body
    let data;
    try {
      const bodyText = await req.text();
      console.log('💎 Raw request body:', bodyText);
      
      if (bodyText.trim()) {
        data = JSON.parse(bodyText);
        console.log('💎 Parsed request data:', data);
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
    
    const { orderId, adminNotes, status } = data;
    
    if (!orderId) {
      console.error('🔴 Missing orderId in request');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Verify ObjectId is valid
    if (!ObjectId.isValid(orderId)) {
      console.error('🔴 Invalid ObjectId:', orderId);
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const ordersCollection = await getOrdersCollection();
    
    // Prepare update object
    const updateFields = {
      updatedAt: new Date()
    };
    
    // Add admin notes if provided
    if (adminNotes !== undefined) {
      updateFields.adminNotes = adminNotes;
    }
    
    // Add status if provided
    if (status !== undefined) {
      console.log('💎 Updating status to:', status);
      updateFields.status = status;
    }
    
    console.log('💎 Update fields:', updateFields);
    
    // Update the order
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(orderId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      console.error('🔴 Order not found with ID:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log('💎 Order updated successfully');
    return NextResponse.json({ 
      success: true,
      order: result.value,
      message: status ? 'Order status updated successfully' : 'Order updated successfully'
    });
  } catch (error) {
    console.error('🔴 Unhandled error in PUT handler:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
} 