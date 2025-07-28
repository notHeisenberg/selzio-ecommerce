import { getAuthUser, authError } from '@/lib/jwt';
import { getUsersCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * Middleware to require authentication for API routes
 * Checks both NextAuth session and JWT tokens
 * 
 * @param {Request} req - Next.js request object
 * @returns {Object|Response} The user data or an error response
 */
export async function requireAuth(req) {
  // First try to get NextAuth session
  try {
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/app/api/auth/[...nextauth]/route');
    
    const session = await getServerSession(authOptions);
    if (session && session.user) {
      return {
        ...session.user,
        source: 'next-auth'
      };
    }
  } catch (error) {
    console.error('Error checking NextAuth session:', error);
  }
  
  // If no NextAuth session, try JWT
  const user = getAuthUser(req);
  if (user) {
    return {
      ...user,
      source: 'jwt'
    };
  }
  
  // No authentication found
  return authError('Authentication required');
}

/**
 * Middleware to require admin role for API routes
 * 
 * @param {Request} req - Next.js request object
 * @returns {Object|Response} The admin user data or an error response
 */
export async function requireAdmin(req) {
  const user = getAuthUser(req);
  
  if (!user) {
    return authError('Authentication required');
  }
  
  // Check if user has admin role
  if (user.role !== 'admin') {
    return authError('Admin access required', 403);
  }
  
  return user;
}

/**
 * Get the full user from database based on JWT token
 * 
 * @param {Request} req - Next.js request object
 * @returns {Object|null} The user from database or null
 */
export async function getFullUser(req) {
  const tokenUser = getAuthUser(req);
  
  if (!tokenUser) {
    return null;
  }
  
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(tokenUser.id) });
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Check if a request is authenticated
 * 
 * @param {Request} req - Next.js request object
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated(req) {
  const user = getAuthUser(req);
  return !!user;
} 