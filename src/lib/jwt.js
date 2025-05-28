import jwt from 'jsonwebtoken';

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

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
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * 
 * @param {string} token - The token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
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
    
    console.log('Auth header:', authHeader ? `Found (${authHeader.substring(0, 15)}...)` : 'Not found');
    
    // Check if header exists and has proper format
    if (!authHeader) {
      console.log('No Authorization header found');
      return null;
    }
    
    // Handle Bearer token format
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Found Bearer token:', token ? `${token.substring(0, 10)}...` : 'Invalid token');
      return token;
    }
    
    // Handle direct token format (no Bearer prefix)
    if (authHeader.length > 20) {
      console.log('Found direct token:', `${authHeader.substring(0, 10)}...`);
      return authHeader;
    }
    
    console.log('Invalid Authorization header format');
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
    console.log('No token found in request');
    return null;
  }
  
  try {
    const decoded = verifyToken(token);
    
    if (!decoded) {
      console.log('Token verification failed');
      return null;
    }
    
    console.log('Successfully authenticated user:', decoded.email || decoded.id);
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