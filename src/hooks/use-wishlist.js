"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children, shouldFetch = false }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  // Set initial loading state
  useEffect(() => {
    // Set a maximum loading time of 5 seconds
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Listen for auth error events
  useEffect(() => {
    const handleAuthError = (event) => {
      // Clear wishlist items on auth error
      setWishlistItems([]);
      
      // Show toast notification
      toast({
        title: "Authentication Error",
        description: event.detail.message || "Please log in again to view your wishlist.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('auth:error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth:error', handleAuthError);
    };
  }, [toast]);
  
  // Function to get auth token from session or localStorage
  const getAuthToken = () => {
    // Try to get token from session first
    const sessionToken = session?.accessToken;
    if (sessionToken) return sessionToken;
    
    // Then try localStorage
    const localToken = localStorage.getItem('auth_token');
    
    // If token exists in localStorage but not in session, it might be stale
    // We'll still return it and let the API call handle any auth errors
    return localToken;
  };
  
  // Function to create headers with auth token
  const createHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn('No auth token available for wishlist request');
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };
  
  // Function to fetch wishlist from API
  const { data: wishlistData, refetch: refetchWishlist, isSuccess } = useQuery({
    queryKey: ['wishlist', user?.id, isAuthenticated, shouldFetch],
    queryFn: async () => {
      // For non-authenticated users, return empty array (guest users cannot have wishlist)
      if (!isAuthenticated || !user) {
        return [];
      }
      
      try {
        // Check if we have a valid token before making the request
        const token = getAuthToken();
        if (!token) {
          console.error('No auth token available for wishlist request');
          toast({
            title: "Authentication Error",
            description: "Please log in again to view your wishlist.",
            variant: "destructive"
          });
          return [];
        }
        
        // For authenticated users, fetch from API
        const response = await axios.get('/api/wishlist', {
          headers: createHeaders(),
          withCredentials: true,
          timeout: 100 // 8 seconds timeout
        });
        
        return response.data.wishlist || [];
      } catch (error) {
        console.error('Failed to fetch wishlist from API:', error);
        
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          // Clear stale token
          localStorage.removeItem('auth_token');
          
          // Show toast to user
          toast({
            title: "Authentication Error",
            description: "Please log in again to view your wishlist.",
            variant: "destructive"
          });
          
          // Set a flag to indicate auth needs refresh
          sessionStorage.setItem('auth_needs_refresh', 'true');
        }
        
        // Make sure we exit loading state on error
        setIsLoading(false);
        return [];
      }
    },
    enabled: isAuthenticated && !!user && shouldFetch, // Only enable if user is authenticated AND shouldFetch is true
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.response && error.response.status === 401) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    onSuccess: (data) => {
      setWishlistItems(data || []);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Query failed:', error);
      setIsLoading(false);
    },
    // Always exit loading state after a reasonable time
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  // Effect to update wishlistItems whenever wishlistData changes
  useEffect(() => {
    
    if (wishlistData !== undefined) {
      // We have data (even if it's an empty array)
      setWishlistItems(wishlistData);
      
      // Ensure we're not in loading state anymore
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [wishlistData, isLoading]);
  
  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (product) => {
      if (!isAuthenticated || !user) {
        // For non-authenticated users, show login prompt
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your wishlist.",
          variant: "destructive"
        });
        throw new Error("Authentication required");
      }
      
      // Check if we have a valid token before making the request
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to add items to your wishlist.",
          variant: "destructive"
        });
        throw new Error("Authentication required");
      }
      
      // Extract essential product data to save with the wishlist
      const productData = {
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || '',
        category: product.category,
        subcategory: product.subcategory,
        stock: product.stock || 0,
        rating: product.rating,
        discount: product.discount,
        productCode: product.productCode
      };
      
      try {
        // For authenticated users, call API
        const response = await axios.post('/api/wishlist', 
          { 
            productId: product.productCode, // Use productCode as the ID
            productData
          },
          { 
            headers: createHeaders(),
            withCredentials: true
          }
        );
        
        return response.data;
      } catch (error) {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          // Clear stale token
          localStorage.removeItem('auth_token');
          
          // Set a flag to indicate auth needs refresh
          sessionStorage.setItem('auth_needs_refresh', 'true');
          
          toast({
            title: "Authentication Error",
            description: "Please log in again to add items to your wishlist.",
            variant: "destructive"
          });
        }
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // If the API call was successful, update local state if product not already in list
      setWishlistItems(prev => {
        if (prev.some(item => item.productCode === variables.productCode)) {
          return prev; // Item already exists
        }
        return [...prev, variables];
      });
      
      // Invalidate and refetch wishlist
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      console.error('Failed to add item to wishlist:', error);
      
      // Only show error if it's not the authentication error we already handled
      if (error.message !== "Authentication required") {
        toast({
          title: 'Error',
          description: 'Failed to add item to wishlist.',
          variant: 'destructive'
        });
      }
    }
  });
  
  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productCode) => {
      if (!isAuthenticated || !user) {
        // For non-authenticated users, show login prompt
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your wishlist.",
          variant: "destructive"
        });
        throw new Error("Authentication required");
      }

      // Check if we have a valid token before making the request
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to manage your wishlist.",
          variant: "destructive"
        });
        throw new Error("Authentication required");
      }
      
      try {
        // Convert productCode to string to ensure consistency
        const stringProductCode = String(productCode);
        
        // For authenticated users, call API
        const response = await axios.delete(`/api/wishlist?productId=${encodeURIComponent(stringProductCode)}`, {
          headers: createHeaders(),
          withCredentials: true,
          timeout: 8000 // 8 seconds timeout
        });
        
        return { productCode: stringProductCode, response: response.data };
      } catch (error) {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
          // Clear stale token
          localStorage.removeItem('auth_token');
          
          // Set a flag to indicate auth needs refresh
          sessionStorage.setItem('auth_needs_refresh', 'true');
          
          toast({
            title: "Authentication Error",
            description: "Please log in again to manage your wishlist.",
            variant: "destructive"
          });
        }
        
        // Detailed error logging
        if (error.response) {
          // Server responded with a status code outside the 2xx range
          console.error('Server error response:', error.response.status, error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          console.error('No response received:', error.request);
        } else {
          // Error in setting up the request
          console.error('Request setup error:', error.message);
        }
        
        // Rethrow for error handling in component
        throw error;
      }
    },
    onMutate: async (productCode) => {
      // Convert productCode to string for consistency
      const stringProductCode = String(productCode);
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']) || [];
      
      // Optimistically update to the new value
      setWishlistItems(prev => prev.filter(item => String(item.productCode) !== stringProductCode));
      
      return { previousWishlist, productCode: stringProductCode };
    },
    onSuccess: (data, variables, context) => {
      
      // Convert variables to string for consistent comparison
      const stringProductCode = String(variables);
      
      // Update local state (this is redundant with the optimistic update but serves as a safety)
      setWishlistItems(prev => prev.filter(item => String(item.productCode) !== stringProductCode));
      
      // Invalidate and refetch wishlist to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error, variables, context) => {
      console.error('Failed to remove item from wishlist:', error);
      
      // Revert to the previous value if we have it
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
        setWishlistItems(context.previousWishlist);
      }
      
      // Only show error if it's not the authentication error we already handled
      if (error.message !== "Authentication required") {
        toast({
          title: 'Error',
          description: 'Failed to remove item from wishlist.',
          variant: 'destructive'
        });
      }
    }
  });
  
  // Check if product is in wishlist
  const isInWishlist = (productCode) => {
    if (!productCode) return false;
    
    // Convert productCode to string for consistent comparison
    const stringProductCode = String(productCode);
    
    // Check both id and productCode fields for compatibility
    return wishlistItems.some(item => 
      String(item.id) === stringProductCode || 
      String(item.productCode) === stringProductCode
    );
  };
  
  // Add to wishlist
  const addToWishlist = (product) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
        action: (
          <div className="mt-2 w-full">
            <button 
              className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-800 focus:ring-offset-white
                dark:border-blue-800/50 dark:text-blue-300 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:hover:text-blue-200
                border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              onClick={() => {
                // Navigate to login page
                window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
              }}
            >
              Login
            </button>
          </div>
        ),
      });
      return false;
    }

    if (isInWishlist(product.productCode)) {
      return false; // Already in wishlist
    }
    
    // Use mutation to add to wishlist
    addToWishlistMutation.mutate(product);
    
    // Show toast notification
    const { dismiss } = toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
      variant: "wishlist",
      action: (
        <div className="mt-2 w-full">
          <button 
            className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-rose-500 dark:focus:ring-offset-gray-800 focus:ring-offset-white
              dark:border-rose-800/50 dark:text-rose-300 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:hover:text-rose-200
              border border-rose-200 bg-rose-300 text-rose-400 hover:bg-rose-100 hover:text-rose-800"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              // Navigate to the wishlist tab in the account page
              window.location.href = '/account?tab=wishlist';
            }}
          >
            <Heart className="h-4 w-4 mr-2 fill-rose-500" />
            View Wishlist
          </button>
        </div>
      ),
    });
    
    return true;
  };
  
  // Remove from wishlist
  const removeFromWishlist = (productCode) => {
    return new Promise((resolve, reject) => {
      // Make sure productCode is a string
      const stringProductCode = String(productCode);

      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage your wishlist.",
          variant: "destructive",
          action: (
            <div className="mt-2 w-full">
              <button 
                className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-500 dark:focus:ring-offset-gray-800 focus:ring-offset-white
                  dark:border-blue-800/50 dark:text-blue-300 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 dark:hover:text-blue-200
                  border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                onClick={() => {
                  // Navigate to login page
                  window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                }}
              >
                Login
              </button>
            </div>
          ),
        });
        return reject(new Error("Authentication required"));
      }
      
      // Find the product before removing it
      const product = wishlistItems.find(item => String(item.productCode) === stringProductCode);
      
      if (!product) {
        console.warn(`Product ${stringProductCode} not found in wishlist. Current items:`, 
          wishlistItems.map(item => ({ productCode: item.productCode, name: item.name })));
      }
      
      // Use mutation to remove from wishlist
      removeFromWishlistMutation.mutate(stringProductCode, {
        onSuccess: () => {
          // Show toast notification if product was found
          if (product) {
            toast({
              title: "Removed from Wishlist",
              description: `${product.name} has been removed from your wishlist.`,
              variant: "wishlist",
            });
          }
          resolve(true);
        },
        onError: (error) => {
          console.error("Error in removeFromWishlist:", error);
          let errorMessage = 'Failed to remove item from wishlist.';
          
          if (error.response) {
            errorMessage = `Server error: ${error.response.status}. Please try again.`;
          } else if (error.request) {
            errorMessage = 'Network error. Check your connection and try again.';
          }
          
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
          });
          
          reject(error);
        }
      });
    });
  };
  
  // Toggle wishlist status
  const toggleWishlist = (product) => {
    if (isInWishlist(product.productCode)) {
      return removeFromWishlist(product.productCode);
    } else {
      return addToWishlist(product);
    }
  };
  
  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your wishlist.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if we have a valid token before making the request
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to manage your wishlist.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Optimistic update
      const previousWishlist = [...wishlistItems];
      setWishlistItems([]);
      
      // Call API to clear wishlist
      await axios.delete('/api/wishlist/clear', {
        headers: createHeaders(),
        withCredentials: true
      });
      
      // Show success message
      toast({
        title: 'Wishlist Cleared',
        description: 'All items have been removed from your wishlist.',
        variant: 'default'
      });
      
      // Invalidate queries to ensure data is fresh
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        // Clear stale token
        localStorage.removeItem('auth_token');
        
        // Set a flag to indicate auth needs refresh
        sessionStorage.setItem('auth_needs_refresh', 'true');
        
        toast({
          title: "Authentication Error",
          description: "Please log in again to manage your wishlist.",
          variant: "destructive"
        });
        return;
      }
      
      // For other errors, show generic message
      toast({
        title: 'Error',
        description: 'Failed to clear your wishlist. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Monitor authentication status and refresh wishlist when auth changes - REMOVED
  
  // Monitor session changes to refresh token - REMOVED
  
  // Check for auth refresh flag - MODIFIED
  useEffect(() => {
    const needsRefresh = sessionStorage.getItem('auth_needs_refresh');
    if (needsRefresh === 'true' && isAuthenticated && user) {
      // Clear the flag
      sessionStorage.removeItem('auth_needs_refresh');
      // No automatic refetching
    }
  }, [isAuthenticated, user]);
  
  const value = {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    totalItems: wishlistItems.length,
    refetchWishlist,
    loadWishlist: () => {
      if (isAuthenticated && user) {
        return refetchWishlist();
      }
      return Promise.resolve({ data: [] });
    }
  };
  
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 