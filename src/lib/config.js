// Configuration values for the application

// Get the current environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Determine the base URL for the application
let baseUrl = '';
if (typeof window !== 'undefined') {
  // Client-side: use the current window location
  baseUrl = window.location.origin;
} else {
  // Server-side: use environment variables
  baseUrl = process.env.NEXTAUTH_URL || 
           process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 
           process.env.NETLIFY_URL || 
           'http://localhost:3000';
  
  // Ensure the URL has a protocol
  if (baseUrl && !baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
}

// Fixed API URL configuration
let apiUrl = process.env.NEXT_PUBLIC_API_URL;

// If no API URL is set, construct it from the base URL
if (!apiUrl) {
  apiUrl = `${baseUrl}/api`;
}

// Clean up malformed URL if necessary
if (apiUrl.includes('/apig')) {
  apiUrl = apiUrl.replace('/apig', '/api');
}

export const apiBaseUrl = apiUrl;
export const appBaseUrl = baseUrl;

// Other configuration values can be added here
export const appName = 'Selzio';
export const appDescription = 'Modern e-commerce platform';