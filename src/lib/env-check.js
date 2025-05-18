/**
 * Utilities to check if required environment variables are set
 */

/**
 * Check if required environment variables for a specific provider are set
 * @param {string} provider - The authentication provider ('google', 'facebook', etc.)
 * @returns {boolean} - Whether all required environment variables are set
 */
export function checkProviderEnvVars(provider) {
  if (!provider) return false;
  
  switch (provider.toLowerCase()) {
    case 'google':
      return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && 
             !!process.env.GOOGLE_CLIENT_SECRET;
    
    case 'facebook':
      return !!process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID && 
             !!process.env.FACEBOOK_CLIENT_SECRET;
    
    default:
      return false;
  }
}

/**
 * Check all environment variables 
 * @returns {Object} - Object with status of each required configuration
 */
export function checkAllEnvVars() {
  return {
    googleConfigured: checkProviderEnvVars('google'),
    facebookConfigured: checkProviderEnvVars('facebook'),
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    mongoDbConfigured: !!process.env.MONGODB_URI,
    cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME && 
                         !!process.env.CLOUDINARY_API_KEY &&
                         !!process.env.CLOUDINARY_API_SECRET
  };
} 