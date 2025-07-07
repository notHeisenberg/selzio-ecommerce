import { NextResponse } from 'next/server';
import { appBaseUrl } from '@/lib/config';

export function middleware(request) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;
  
  // Handle authentication redirects
  if (pathname.startsWith('/api/auth/callback')) {
    const response = NextResponse.next();
    
    // Get the stored redirect URL from sessionStorage (client-side)
    // We can't access sessionStorage directly in middleware, so we'll use cookies
    const authRedirect = request.cookies.get('auth_redirect');
    
    // If we have a redirect URL in the cookie, keep it for the API route
    if (authRedirect) {
      response.cookies.set('auth_redirect', authRedirect.value, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 5, // 5 minutes
      });
    }
    
    return response;
  }
  
  // For checkout page, check if we need to store a redirect URL
  if (pathname.startsWith('/checkout')) {
    const response = NextResponse.next();
    
    // Store the full URL including domain as a cookie for auth redirects
    // Use the request URL or the configured base URL
    const fullUrl = request.url;
    
    // Store the base URL as well for the API to use
    const baseUrl = appBaseUrl || request.nextUrl.origin;
    
    response.cookies.set('checkout_redirect', fullUrl, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 30, // 30 minutes
    });
    
    response.cookies.set('site_base_url', baseUrl, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 30, // 30 minutes
    });
    
    return response;
  }
  
  return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/api/auth/callback/:path*',
    '/checkout/:path*',
  ],
}; 