"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { useEffect, useCallback } from 'react';

export function useUserProfile() {
  const { api, user: authUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Define the query key for user profile
  const profileQueryKey = ['userProfile'];
  
  // On mount, try to load stored user data from localStorage
  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        queryClient.setQueryData(profileQueryKey, userData);
      }
    } catch (error) {
      console.error('Error restoring user data from localStorage:', error);
    }
  }, [queryClient]);
  
  // Fetch user profile
  const { 
    data: user, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      // If we already have user data from auth context, use it initially
      if (authUser) {
        // Set the initial data from auth context
        queryClient.setQueryData(profileQueryKey, authUser);
      }
      
      try {
        // Make sure we have a valid token before making the API call
        const token = localStorage.getItem('auth_token');
        if (!token) {
          console.warn('No auth token available for profile fetch');
          if (authUser) {
            return authUser; // Return cached user data if available
          }
          throw new Error('Authentication required');
        }
        
        // Set authorization header explicitly for this request
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        // Fetch the latest user data from API
        const response = await api.get('/api/users/profile', { headers });
        
        // Save to localStorage for persistence
        if (response.data) {
          try {
            localStorage.setItem('user_data', JSON.stringify(response.data));
          } catch (e) {
            console.error('Failed to save user data to localStorage:', e);
          }
        }
        
        return response.data;
      } catch (error) {
        console.error('Profile fetch error:', error.response?.status, error.message);
        
        // Handle 401 errors specifically
        if (error.response?.status === 401) {
          console.warn('Authentication token invalid or expired');
          // Don't throw an error if we have fallback data
          if (authUser) {
            return authUser;
          }
        }
        
        // If API call fails but we have auth user, use that
        if (authUser) {
          return authUser;
        }
        throw error;
      }
    },
    // If auth user exists, use it as initial data to prevent loading state
    initialData: authUser,
    enabled: !!api && isAuthenticated, // Only run query if authenticated and API is available
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    refetchOnMount: true, // Always refetch on component mount
    refetchOnReconnect: true, // Refetch on reconnection
    retry: 2, // Retry failed requests twice
  });

  // Update user profile
  const updateProfile = useMutation({
    mutationFn: async (profileData) => {
      try {
        // Make sure we have a valid token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Set headers explicitly for this request
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const response = await api.put('/api/users/profile', profileData, { headers });
        
        // Update localStorage with new user data
        if (response.data && response.data.user) {
          try {
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
          } catch (e) {
            console.error('Failed to save user data to localStorage:', e);
          }
        }
        
        return response.data;
      } catch (error) {
        console.error('Profile update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update the query data with the new user data
      queryClient.setQueryData(profileQueryKey, data.user);
      
      // Invalidate query to refetch if needed
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });

  // Update password
  const updatePassword = useMutation({
    mutationFn: async (passwordData) => {
      try {
        // Make sure we have a valid token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Set headers explicitly for this request
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const response = await api.put('/api/users/profile', passwordData, { headers });
        return response.data;
      } catch (error) {
        console.error('Password update error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update the query data with the new user data
      if (data.user) {
        queryClient.setQueryData(profileQueryKey, data.user);
        // Update localStorage with new user data
        try {
          localStorage.setItem('user_data', JSON.stringify(data.user));
        } catch (e) {
          console.error('Failed to save user data to localStorage:', e);
        }
      }
      
      // Invalidate query to refetch and ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    },
  });

  // Make sure we always have a user, either from query, authUser or localStorage
  const currentUser = user || authUser || (() => {
    try {
      const storedData = localStorage.getItem('user_data');
      return storedData ? JSON.parse(storedData) : null;
    } catch (e) {
      return null;
    }
  })();

  // Function to force refresh profile data
  const refreshProfile = useCallback(async () => {
    try {
      // Make sure we have a valid token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token available for profile refresh');
        return null;
      }

      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      
      try {
        const result = await refetch();
        return result.data;
      } catch (refetchError) {
        console.error('Error during profile refetch:', refetchError);
        // If we have user data in context, return that as fallback
        if (authUser) {
          return authUser;
        }
        return null;
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }, [queryClient, refetch, authUser]);

  return {
    user: currentUser,
    isLoading,
    isError,
    error,
    refetch,
    refreshProfile,
    updateProfile,
    updatePassword,
    
    // Helper functions to check user state
    isSocialUser: currentUser && 
      (currentUser.googleId || currentUser.facebookId),
    hasPassword: currentUser && currentUser.hasPassword === true,
    needsEmail: currentUser && !currentUser.email,
  };
} 