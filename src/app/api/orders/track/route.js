import { NextResponse } from 'next/server';
import { getOrdersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET endpoint to track an order by ID without authentication
export async function GET(req) {
  try {
    // Get the order ID from the URL query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    // Validate the ID
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get the orders collection
    const ordersCollection = await getOrdersCollection();
    
    // Check if it's a shortened ID format (ORD-XXXXXX)
    if (id.toUpperCase().startsWith('ORD-') && id.length >= 10) {
      // Extract the last 6 characters (ignoring case)
      const shortId = id.slice(4).toLowerCase();
      
      // Find all orders and filter by matching the last 6 chars of ObjectId
      const allOrders = await ordersCollection.find({}).toArray();
      
      // Find the matching order
      const matchingOrder = allOrders.find(order => {
        // Get the ObjectId as string and take last 6 chars
        const orderIdStr = order._id.toString();
        const lastSixChars = orderIdStr.slice(-6).toLowerCase();
        
        // Compare with our short ID (case insensitive)
        return lastSixChars === shortId;
      });
      
      if (matchingOrder) {
        // Remove sensitive information before returning
        const sanitizedOrder = {
          ...matchingOrder,
          adminNotes: undefined,
        };
        
        return NextResponse.json({ order: sanitizedOrder });
      } else {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    } 
    // If it's a full MongoDB ObjectId
    else if (ObjectId.isValid(id)) {
      const order = await ordersCollection.findOne({ _id: new ObjectId(id) });
      
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      // Remove sensitive information before returning
      const sanitizedOrder = {
        ...order,
        adminNotes: undefined,
      };
      
      return NextResponse.json({ order: sanitizedOrder });
    } 
    // If it's neither a valid shortened ID nor ObjectId
    else {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 