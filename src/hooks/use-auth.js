"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup axios interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Check if we have session data available in the window object
        if (typeof window !== 'undefined' && window.__NEXT_DATA__?.props?.pageProps?.session?.accessToken) {
          const sessionToken = window.__NEXT_DATA__.props.pageProps.session.accessToken;
          config.headers.Authorization = `Bearer ${sessionToken}`;
          // Store it for future use
          localStorage.setItem('auth_token', sessionToken);
        }
      }
    } catch (error) {
      console.error('Error setting auth header:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Setup axios interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized responses
    if (error.response && error.response.status === 401) {
      // Clear auth data if we get an unauthorized response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Don't redirect automatically - this causes a redirect loop
      // Instead, we'll let the components handle the redirect when needed
      // window.location.href = '/auth/login';
      
      // Set a flag to indicate auth error happened
      sessionStorage.setItem('auth_error', 'true');
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Listen for storage events (when localStorage is changed from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user_data') {
        try {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Sync with NextAuth session
  useEffect(() => {
    if (status === 'authenticated' && session) {

      const sessionUser = session.user;
      const token = session.accessToken || 'oauth-token'; // Fallback for OAuth providers
      
      if (sessionUser) {
        
        // Make sure role is properly set
        if (!sessionUser.role && sessionUser.isAdmin) {
          sessionUser.role = 'admin';
        }
        
        // Save auth data to localStorage
        try {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_data', JSON.stringify(sessionUser));
        } catch (e) {
          console.error('Failed to write to localStorage:', e);
        }
        
        // Set default authorization header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        setUser(sessionUser);
        setLoading(false);
        
        // Check if we have a stored redirect destination
        let storedRedirect;
        try {
          storedRedirect = sessionStorage.getItem('auth_redirect');
        } catch (e) {
          console.error('Failed to access sessionStorage:', e);
        }
        
        if (storedRedirect) {
          // Wait a bit to ensure all auth state is properly set
          setTimeout(() => {
            try {
              sessionStorage.removeItem('auth_redirect');
            } catch (e) {
              console.error('Failed to remove from sessionStorage:', e);
            }
            router.push(storedRedirect);
          }, 500);
        }
      }
    } else if (status === 'unauthenticated') {
    }
  }, [session, status, router]);
  
  // Check if user is already logged in on initial render
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check NextAuth session
        if (status === 'authenticated' && session) {
          const sessionUser = session.user;
          const token = session.accessToken;
          
          if (sessionUser && token) {
            // Save auth data to localStorage
            try {
              localStorage.setItem('auth_token', token);
              localStorage.setItem('user_data', JSON.stringify(sessionUser));
            } catch (e) {
              console.error('Failed to write to localStorage:', e);
            }
            
            // Set default authorization header for all requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update state
            setUser(sessionUser);
            setLoading(false);
            return;
          }
        }
        
        // Fall back to localStorage check for token
        let token;
        let userData;
        
        try {
          token = localStorage.getItem('auth_token');
          userData = localStorage.getItem('user_data');
        } catch (e) {
          console.error('Failed to read from localStorage:', e);
          token = null;
          userData = null;
        }
        
        if (token) {
          // Set default authorization header for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user info from localStorage
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              
              // Verify token validity with a quick API call if needed
              try {
                const response = await api.get('/api/users/profile');
                if (response.data) {
                  // Update with latest data
                  setUser(response.data);
                  try {
                    localStorage.setItem('user_data', JSON.stringify(response.data));
                  } catch (e) {
                    console.error('Failed to update localStorage:', e);
                  }
                }
              } catch (apiError) {
                // If API call fails with 401, clear the stored token and user data
                if (apiError.response && apiError.response.status === 401) {
                  try {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');
                  } catch (e) {
                    console.error('Failed to clear localStorage:', e);
                  }
                  setUser(null);
                } else {
                  // For other errors, keep using cached data
                  console.warn('Could not verify token with API:', apiError);
                }
              }
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              try {
                localStorage.removeItem('user_data');
              } catch (e) {
                console.error('Failed to remove from localStorage:', e);
              }
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear auth data on critical errors to prevent loops
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Always run checkAuth when status changes instead of using sessionStorage flag
    // This ensures authentication state is properly restored after page reload
    if (status !== 'loading') {
      checkAuth();
    }
  }, [status, session]);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      throw new Error('Email and password are required');
    }
    
    try { 
      // Create request configuration with timeout
      const config = {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await api.post('/api/auth', { 
        email, 
        password 
      }, config);
      
      const data = response.data;
      
      if (!data.token || !data.user) {
        console.error('Invalid response from auth API:', data);
        throw new Error('Invalid response from authentication service');
      }
      
      // Save auth data to localStorage
      try {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      } catch (storageError) {
        console.error('Failed to save auth data to localStorage:', storageError);
        // Continue since the data is already in memory
      }
      
      // Set default authorization header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Update state
      setUser(data.user);
      
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with an error status
        const errorMessage = error.response.data?.error || `Authentication failed (${error.response.status})`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        const errorMessage = 'No response from authentication service. Please try again later.';
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        // Something else caused the error
        const errorMessage = error.message || 'Login failed';
        setError(errorMessage);
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Social login function for Google
  const loginWithGoogle = async (redirect = '/') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('google', { 
        callbackUrl: redirect,
        redirect: true  // Changed to true so it redirects properly
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message || 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Social login function for Facebook
  const loginWithFacebook = async (redirect = '/') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('facebook', { 
        callbackUrl: redirect,
        redirect: true  // Changed to true so it redirects properly
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      return result;
    } catch (error) {
      setError(error.message || 'Facebook login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Update state
    setUser(null);
    
    // Sign out from NextAuth
    signOut({ redirect: false });
    
    // Redirect to home page
    router.push('/');
  };
  
  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', userData);
      const data = response.data;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to explicitly refresh user data from the server
  const refreshUserData = async () => {
    try {
      const response = await api.get('/api/users/profile');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user_data', JSON.stringify(response.data));
        return true;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
    return false;
  };

  const value = {
    user,
    loading: loading || status === 'loading',
    error,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    register,
    refreshUserData, // Add the refresh function to the context
    isAuthenticated: !!user,
    api, // Expose API instance for use in other components
    
    // Helper function to store intended redirect destination
    storeRedirectDestination: (destination) => {
      if (typeof window !== 'undefined') {
        
        sessionStorage.setItem('auth_redirect', destination);
      }
    },
    
    // Helper function to get and clear the redirect destination
    getStoredRedirectDestination: () => {
      if (typeof window !== 'undefined') {
        const destination = sessionStorage.getItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect');
        return destination;
      }
      return null;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 