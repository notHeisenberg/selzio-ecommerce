import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Simple endpoint to check authentication status
export async function GET(request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({
        isAuthenticated: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    // Return authentication status and user ID
    return NextResponse.json({
      isAuthenticated: true,
      userId: session.user.id,
      session: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      }
    });
  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json({
      isAuthenticated: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 