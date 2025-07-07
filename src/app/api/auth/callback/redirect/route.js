import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { appBaseUrl } from '@/lib/config';

export async function GET(request) {
  try {
    // Get the auth token from the request
    const token = await getToken({ req: request });
    
    // Get the stored redirect URL from the cookie
    const redirectCookie = cookies().get('auth_redirect');
    
    // Determine where to redirect
    let redirectUrl = '/';
    
    // Check for a redirect URL in the token first
    if (token?.redirectUrl) {
      redirectUrl = token.redirectUrl;
    }
    // Then check for a redirect URL in the cookie
    else if (redirectCookie?.value) {
      try {
        redirectUrl = decodeURIComponent(redirectCookie.value);
      } catch (e) {
        console.error('Failed to decode redirect URL:', e);
      }
    }
    
    // Make sure the URL is absolute
    if (!redirectUrl.startsWith('http')) {
      // Get the base URL from the config or request
      const host = request.headers.get('host') || '';
      const protocol = host.includes('localhost') ? 'http:' : 'https:';
      const baseUrl = appBaseUrl || `${protocol}//${host}`;
      
      redirectUrl = `${baseUrl}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
    }
    
    // Redirect to the final URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in redirect handler:', error);
    
    // Fallback to the home page
    const baseUrl = appBaseUrl || new URL('/', request.url).origin;
    return NextResponse.redirect(baseUrl);
  }
} 