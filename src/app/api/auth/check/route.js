import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookies = cookies.filter(c => c.startsWith('next-auth.session-token') || c.includes('session'));
    
    // Create a safe response object
    const response = {
      authenticated: !!session && !!session.user,
      hasSession: !!session,
      hasUser: session ? !!session.user : false,
      hasId: session?.user?.id ? true : false,
      hasCookies: sessionCookies.length > 0,
      cookieCount: cookies.length,
      sessionCookieCount: sessionCookies.length,
    };
    
    if (!session) {
      return NextResponse.json({
        ...response,
        error: 'No session found',
        status: 'unauthenticated'
      }, { status: 401 });
    }
    
    if (!session.user) {
      return NextResponse.json({
        ...response,
        error: 'No user in session',
        status: 'incomplete'
      }, { status: 401 });
    }
    
    // User is authenticated
    return NextResponse.json({
      ...response,
      status: 'authenticated',
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error.message,
      status: 'error'
    }, { status: 500 });
  }
} 