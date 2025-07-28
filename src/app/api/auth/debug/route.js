import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Debug endpoint to check session state
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Create a safe version of the session for logging
    const safeSession = session ? {
      exists: true,
      hasUser: !!session.user,
      hasToken: !!session.accessToken,
      user: session.user ? {
        id: session.user.id,
        hasId: !!session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null
    } : { exists: false };
    
    // Return detailed session info
    return NextResponse.json({
      session: safeSession,
      cookies: {
        count: request.cookies.size
      },
      headers: {
        authorization: !!request.headers.get('authorization'),
        cookie: !!request.headers.get('cookie')
      }
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 