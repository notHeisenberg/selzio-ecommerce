import jwt from 'jsonwebtoken';

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'development-fallback-secret-do-not-use-in-production';

// Log a warning if using the fallback secret
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET in your environment variables for production.');
}

// Default token expiration (7 days)
const DEFAULT_EXPIRATION = '7d';

/**
 * Generate a JWT token for a user
 * 
 * @param {Object} payload - The data to encode in the token
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} The JWT token
 */
export function generateToken(payload, expiresIn = DEFAULT_EXPIRATION) {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Authentication token generation failed');
  }
}

/**
 * Verify a JWT token
 * 
 * @param {string} token - The token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) {
    
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param {Request} req - Next.js request object
 * @returns {string|null} The token or null if not found
 */
export function extractTokenFromHeader(req) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    
    
    
    // Check if header exists and has proper format
    if (!authHeader) {
      
      return null;
    }
    
    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      return token;
    }
    
    // Handle direct token format (no Bearer prefix)
    if (authHeader.length > 20) {
      
      return authHeader;
    }
    
    
    return null;
  } catch (error) {
    console.error('Error extracting token:', error);
    return null;
  }
}

/**
 * Middleware to verify if the request has a valid JWT token
 * 
 * @param {Request} req - Next.js request object
 * @returns {Object|null} The decoded user data or null if unauthorized
 */
export function getAuthUser(req) {
  const token = extractTokenFromHeader(req);
  
  if (!token) {
    
    return null;
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Generate an auth error response
 * 
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response} JSON response with error
 */
export function authError(message = 'Unauthorized', status = 401) {
  return Response.json({ error: message }, { status });
} 