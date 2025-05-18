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
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
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
  
  const decoded = verifyToken(token);
  return decoded;
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