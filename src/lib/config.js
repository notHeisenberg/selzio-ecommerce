// Configuration values for the application

// Fixed API URL configuration
let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Clean up malformed URL if necessary
if (apiUrl.includes('/apig')) {
  apiUrl = apiUrl.replace('/apig', '/api');
}

export const apiBaseUrl = apiUrl;

// Other configuration values can be added here
export const appName = 'Selzio';
export const appDescription = 'Modern e-commerce platform'; 