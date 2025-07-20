"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useSession } from 'next-auth/react';

export const orderStatuses = {
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  processing: { label: 'Processing', color: 'bg-blue-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' }
};

export function useOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { data: session } = useSession();
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true || user?.admin === true;
  
  // State for filtering and pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  
  const [filter, setFilter] = useState({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    userId: isAdmin ? 'all' : undefined, // Only used by admins
    searchTerm: '' // For searching by order ID or customer name
  });

  // Fetch orders with TanStack Query
  const { 
    data: ordersData, 
    isLoading, 
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['orders', pagination.page, pagination.limit, filter, isAdmin, isAuthenticated],
    queryFn: async () => {
      try {
        if (!isAuthenticated) {
          console.error('User is not authenticated');
          throw new Error('Authentication required');
        }
        
        // Build query string for filtering and pagination
        const params = new URLSearchParams();
        params.append('page', pagination.page);
        params.append('limit', pagination.limit);
        
        if (filter.status && filter.status !== 'all') {
          params.append('status', filter.status);
        }
        
        // Admin-specific filters
        if (isAdmin && filter.userId && filter.userId !== 'all') {
          params.append('userId', filter.userId);
        }
        
        if (filter.searchTerm) {
          params.append('search', filter.searchTerm);
        }
        
        params.append('sortBy', filter.sortBy);
        params.append('sortOrder', filter.sortOrder);
        
        // Determine the endpoint based on user role
        const endpoint = `/api/orders?${params.toString()}`;
        

        // Get authentication data from multiple sources
        let token;
        try {
          token = localStorage.getItem('auth_token');
        } catch (e) {
          console.error('Cannot access localStorage:', e);
          token = null;
        }
        
        const sessionToken = session?.accessToken;
        
        // Use session token if available as it's more likely to be current
        if (sessionToken) {
          token = sessionToken;
          // Update localStorage with current session token
          try {
            localStorage.setItem('auth_token', sessionToken);
          } catch (e) {
            console.error('Cannot write to localStorage:', e);
          }
        }
        
        
        if (!token) {
          
          throw new Error('Authentication token required');
        }
        
        // Make sure we have proper auth headers
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Make the request
        const response = await axios.get(endpoint, { 
          headers,
          withCredentials: true // This enables sending cookies with the request
        });
        
        // Update pagination state
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
        
        return response.data;
      } catch (error) {
        console.error('Error in orders API call:', error.response?.status, error.response?.data);
        
        // If unauthorized, try to refresh the auth state
        if (error.response?.status === 401) {
          
          
          // Verify if we still have a valid session
          if (session && session.accessToken) {
            
            localStorage.setItem('auth_token', session.accessToken);
            
            // Attempt one more request with the session token
            try {
              const retryResponse = await axios.get(endpoint, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.accessToken}`
                },
                withCredentials: true
              });
              return retryResponse.data;
            } catch (retryError) {
              console.error('Retry failed with session token:', retryError);
            }
          }
          
          // Attempt to verify token validity with the auth check endpoint
          try {
            await axios.get('/api/auth/check', {
              withCredentials: true
            });
          } catch (checkError) {
            console.error('Auth check failed:', checkError);
            // Force refresh auth state
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
            throw new Error('Authentication session expired. Please log in again.');
          }
        }
        
        throw error;
      }
    },
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: true,
    keepPreviousData: true,
    enabled: isAuthenticated, // Only run query if user is authenticated
    onError: (error) => {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Delete order mutation
  const deleteOrder = useMutation({
    mutationFn: async (orderId) => {
      // Ensure orderId is a valid string
      const safeOrderId = orderId.toString();
      
      // Try to use session token first, fallback to localStorage token
      const token = session?.accessToken || localStorage.getItem('auth_token');
      
      return await axios.delete(`/api/orders/${safeOrderId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order deleted successfully',
        variant: 'success'
      });
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete order. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }) => {
      // Ensure orderId is a valid string
      const safeOrderId = orderId.toString();
      
      // Try to use session token first, fallback to localStorage token
      const token = session?.accessToken || localStorage.getItem('auth_token');
        
      // Use the main order endpoint with orderId in the path
      const response = await axios.put(`/api/orders/${safeOrderId}`, 
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true
        }
      );
 
      // Check if the response indicates success
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Failed to update order status');
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
        variant: 'success'
      });
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: `Failed to update order status: ${error.response?.data?.error || error.message}`,
        variant: 'destructive'
      });
    }
  });

  // Get all users who have placed orders (for admin filtering)
  // Create a fake users list for now since the simplified API doesn't return users
  const usersWithOrders = [];
  const loadingUsers = false;

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset to page 1 when filter changes
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  // Get single order details
  const getOrderDetails = async (orderId) => {
    try {
      // Ensure orderId is a valid string
      const safeOrderId = orderId.toString();
      
      // Try to use session token first, fallback to localStorage token
      const token = session?.accessToken || localStorage.getItem('auth_token');
      
      const response = await axios.get(`/api/orders/${safeOrderId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true
      });
      return response.data.order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order details.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    // Data
    orders: ordersData?.orders || [],
    pagination,
    filter,
    orderStatuses,
    usersWithOrders: usersWithOrders || [],
    loadingUsers,
    isAdmin,
    
    // Status
    isLoading,
    isError,
    isFetching,
    error,
    
    // Actions
    deleteOrder,
    updateOrderStatus,
    handlePageChange,
    handleFilterChange,
    refetch,
    getOrderDetails
  };
} 