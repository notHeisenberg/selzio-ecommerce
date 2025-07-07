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
      redirectUrl = `${appBaseUrl}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
    }
    
    // If there's an error parameter in the URL, remove it
    const url = new URL(redirectUrl);
    if (url.searchParams.has('error')) {
      url.searchParams.delete('error');
      redirectUrl = url.toString();
    }
    
    // Redirect to the final URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in redirect handler:', error);
    
    // Fallback to the home page
    return NextResponse.redirect(appBaseUrl);
  }
} 