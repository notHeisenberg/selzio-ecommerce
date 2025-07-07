import { NextResponse } from 'next/server';
import { appBaseUrl } from '@/lib/config';

export async function GET(request) {
  try {
    // Get the base URL from config or request
    const host = request.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http:' : 'https:';
    const baseUrl = appBaseUrl || `${protocol}//${host}`;
    
    // Always redirect to checkout page after OAuth login
    const redirectUrl = `${baseUrl}/checkout`;
    
    // Redirect to the checkout page
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in redirect handler:', error);
    
    // Fallback to the home page
    const baseUrl = appBaseUrl || new URL('/', request.url).origin;
    return NextResponse.redirect(baseUrl);
  }
} 