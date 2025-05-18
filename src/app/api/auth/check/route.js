import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

// Simple endpoint to check authentication status
export async function GET(req) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found'
      }, { status: 401 });
    }
    
    // Check session validity
    const userInfo = {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isAdmin: session.user.role === 'admin' || 
                 session.user.isAdmin === true || 
                 session.user.admin === true
      },
      hasToken: !!session.accessToken
    };
    
    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error.message
    }, { status: 500 });
  }
} 