"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Package, Trash2, Eye, AlertCircle, RefreshCw, Loader2, User, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useOrders, orderStatuses } from '@/hooks/use-orders';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, addHours, isAfter } from 'date-fns';

export default function OrdersTab() {
  const { user } = useAuth();
  const { toast } = useToast();


  // Use the custom hook for orders
  const {
    orders,
    pagination,
    filter,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    deleteOrder,
    updateOrderStatus,
    handlePageChange,
    handleFilterChange,
    getOrderDetails,
    isAdmin,
    usersWithOrders,
    loadingUsers
  } = useOrders();

  // State for order management
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // State for order details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  // State for search input
  const [searchInput, setSearchInput] = useState('');

  // State for admin notes
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Add these new states for cancellation
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [submittingCancellation, setSubmittingCancellation] = useState(false);

  // Predefined cancellation reasons
  const cancellationReasons = [
    "Changed my mind",
    "Found better price elsewhere",
    "Ordered by mistake",
    "Delivery time too long",
    "Other (please specify)"
  ];

  // Function to handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('searchTerm', searchInput);
  };

  // Reset search
  const clearSearch = () => {
    setSearchInput('');
    handleFilterChange('searchTerm', '');
  };

  // Function to handle opening order details
  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
    setLoadingDetails(true);
    setDetailsError(null);
    setOrderDetails(null); // Reset previous order details
    setAdminNotes(''); // Reset admin notes

    try {
      if (!order || !order._id) {
        throw new Error('Invalid order information');
      }

      // Safely get order details
      const details = await getOrderDetails(order._id);

      // Validate required order structure
      if (!details) {
        throw new Error('Could not retrieve order details');
      }

      // Set the validated order details
      setOrderDetails(details);

      // Set admin notes if they exist
      if (details.adminNotes) {
        setAdminNotes(details.adminNotes);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setDetailsError(error.message || 'Failed to load order details. Please try again.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle delete order
  const handleDeleteOrder = () => {
    if (!selectedOrder) return;
    deleteOrder.mutate(selectedOrder._id, {
      onSuccess: () => setDeleteDialogOpen(false)
    });
  };

  // Handle status update
  const handleStatusUpdate = () => {
    if (!selectedOrder || !selectedStatus) return;

    // Use the mutation from useOrders hook
    updateOrderStatus.mutate({
      orderId: selectedOrder._id,
      status: selectedStatus
    }, {
      onSuccess: () => {
        setStatusDialogOpen(false);
        refetch();
      },
      onError: (error) => {
        console.error('Status update failed through mutation:', error);

        // Direct API call as fallback (one attempt only)
        const updateDirectly = async () => {
          try {
            setUpdatingStatus(true);

            const response = await fetch(`/api/orders/${selectedOrder._id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: selectedStatus
              }),
              credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Status update failed');
            }

            if (data.success) {
              toast({
                title: 'Success',
                description: 'Order status updated successfully',
                variant: 'success'
              });

              setStatusDialogOpen(false);
              refetch();
            } else {
              throw new Error(data.error || 'Status update failed');
            }
          } catch (error) {
            console.error('Status update failed:', error);

            toast({
              title: 'Error',
              description: `Failed to update status: ${error.message}`,
              variant: 'destructive'
            });
          } finally {
            setUpdatingStatus(false);
          }
        };

        updateDirectly();
      }
    });
  };

  // Handle saving admin notes
  const handleSaveNotes = async () => {
    if (!selectedOrder || !orderDetails) return;

    setSavingNotes(true);
    try {
      // Use the [id] endpoint directly with the ID in the path
      const response = await axios.put(`/api/orders/${selectedOrder._id}`, {
        adminNotes: adminNotes
      }, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') && {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`
          })
        },
        withCredentials: true
      });

      if (response.data && response.data.success) {
        // Update local state with the new notes
        const updatedOrderDetails = { ...orderDetails, adminNotes };
        setOrderDetails(updatedOrderDetails);

        toast({
          title: 'Success',
          description: 'Admin notes saved successfully',
          variant: 'success'
        });

        // Refresh the orders list to get updated data
        refetch();
      } else {
        throw new Error(response.data?.error || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving admin notes:', error);
      toast({
        title: 'Error',
        description: `Failed to save admin notes: ${error.response?.data?.error || error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSavingNotes(false);
    }
  };

  // Add this function to check if order is within cancellation window (6 hours)
  const isWithinCancellationWindow = (orderDate) => {
    const orderDateTime = new Date(orderDate);
    const cancellationDeadline = addHours(orderDateTime, 6);
    return !isAfter(new Date(), cancellationDeadline);
  };

  // Check if an order can have a cancellation request (not cancelled or already requested)
  const canRequestCancellation = (order) => {
    // Order must be in pending status
    if (order.status !== 'pending') {
      return false;
    }
    
    // Must be within time window
    if (!isWithinCancellationWindow(order.createdAt)) {
      return false;
    }
    
    // Check if it ever had a cancellation request before
    if (order.cancellationRequestedAt || order.cancellationResponded) {
      return false;
    }
    
    return true;
  };

  // Add this function to handle cancellation request
  const handleCancellationRequest = async () => {
    if (!selectedOrder) return;
    
    // Validate reason
    if (!cancellationReason || (cancellationReason === "Other (please specify)" && !otherReason.trim())) {
      toast({
        title: "Error",
        description: "Please provide a valid reason for cancellation",
        variant: "destructive"
      });
      return;
    }
    
    setSubmittingCancellation(true);
    
    try {
      // Format the final reason text
      const finalReason = cancellationReason === "Other (please specify)" 
        ? otherReason.trim() 
        : cancellationReason;
        
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      // Call API to update order status to cancellation_requested with reason
      const response = await axios.put(`/api/orders/${selectedOrder._id}`, 
        {
          status: "cancellation_requested",
          cancellationReason: finalReason,
          cancellationRequestedAt: new Date().toISOString()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true
        }
      );
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: "Cancellation request submitted successfully",
          variant: "success"
        });
        
        setCancellationDialogOpen(false);
        refetch();
      } else {
        throw new Error(response.data?.error || "Failed to submit cancellation request");
      }
    } catch (error) {
      console.error('Error submitting cancellation request:', error);
      toast({
        title: "Error",
        description: `Failed to submit cancellation request: ${error.response?.data?.error || error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmittingCancellation(false);
    }
  };

  // Add this function to handle admin approval/rejection of cancellation
  const handleCancellationResponse = async (approved) => {
    if (!selectedOrder) return;
    
    setUpdatingStatus(true);
    
    try {
      const newStatus = approved ? "cancelled" : "pending"; // Always return to pending if rejected
      
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      // Use axios instead of fetch for better header handling
      const response = await axios.put(`/api/orders/${selectedOrder._id}`, 
        {
          status: newStatus,
          cancellationResponded: true,
          cancellationApproved: approved,
          cancellationRespondedAt: new Date().toISOString()
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true
        }
      );
      
      
      if (response.data && response.data.success) {
        toast({
          title: "Success",
          description: approved 
            ? "Order cancellation approved" 
            : "Order cancellation rejected",
          variant: "success"
        });
        
        setDetailsDialogOpen(false);
        refetch();
      } else {
        throw new Error(response.data?.error || "Failed to process cancellation request");
      }
    } catch (error) {
      console.error('Error processing cancellation request:', error);
      toast({
        title: "Error",
        description: `Failed to process cancellation: ${error.response?.data?.error || error.message}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Update the orderStatuses object to include cancellation_requested status
  const extendedOrderStatuses = {
    ...orderStatuses,
    cancellation_requested: {
      label: "Cancellation Requested",
      color: "bg-orange-500"
    }
  };

  // Show loading state for initial load
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? 'Order Management' : 'Order History'}</CardTitle>
          <CardDescription>
            {isAdmin ? 'View and manage all customer orders' : 'View and manage your orders'}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          {/* Filter and Sort Controls */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={filter.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(extendedOrderStatuses).map(([value, { label }]) => (
                    <SelectItem key={`status-${value}`} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filter.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              {/* Admin-only user filter */}
              {isAdmin && (
                <Select
                  value={filter.userId}
                  onValueChange={(value) => handleFilterChange('userId', value)}
                  disabled={loadingUsers}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by customer">
                      {loadingUsers ? 'Loading...' : 'Filter by customer'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All customers</SelectItem>
                    {usersWithOrders.map(user => (
                      <SelectItem key={user._id || `user-${Math.random().toString(36).substr(2, 9)}`} value={user._id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Search bar for admins */}
            {isAdmin && (
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by order ID (last 6 digits), customer name, or phone"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="outline" className="hover:bg-violet-50 hover:border-violet-300 transition-colors duration-200">
                  Search
                </Button>
                {filter.searchTerm && (
                  <Button type="button" variant="ghost" onClick={clearSearch} size="sm">
                    Clear
                  </Button>
                )}
              </form>
            )}
          </div>

          {isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load orders. {error?.message || 'Please try again.'}
                {error?.response?.data?.error && (
                  <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                    API Error: {error.response.data.error}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading overlay for refetching */}
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-none z-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {orders.length === 0 ? (
            <div key={orders.length} className="text-center py-6">
              <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {filter.status && filter.status !== 'all'
                  ? `No orders found with status: ${extendedOrderStatuses[filter.status]?.label || filter.status}`
                  : filter.searchTerm
                    ? `No orders found matching: "${filter.searchTerm}"`
                    : isAdmin && filter.userId && filter.userId !== 'all'
                      ? 'No orders found for this customer'
                      : 'No orders found'}
              </p>
              {!isAdmin && (
                <Button asChild className="mt-4">
                  <Link href="/store">Start Shopping</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="border rounded-none p-4 space-y-4 hover:shadow-md transition-shadow duration-200 border-border hover:border-primary/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-primary">Order #{order._id.slice(-6).toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {/* Admin sees customer info */}
                      {isAdmin && order.user && (
                        <div className="flex items-center mt-1 text-sm text-primary">
                          <User className="h-3 w-3 mr-1" />
                          <span>{order.user.name || order.user.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${extendedOrderStatuses[order.status]?.color || 'bg-gray-500'} text-white capitalize font-medium px-3 py-1 rounded-full text-xs`}>
                        {extendedOrderStatuses[order.status]?.label || order.status}
                      </Badge>
                      <div className="flex flex-wrap gap-2">
                        {(isAdmin || user?.role === 'admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedStatus(order.status);
                              setStatusDialogOpen(true);
                            }}
                            className="hover:bg-primary/5 hover:border-primary/20 transition-colors duration-200"
                          >
                            Update Status
                          </Button>
                        )}
                        {/* Show cancel request button for users if eligible */}
                        {!isAdmin && canRequestCancellation(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setCancellationReason('');
                              setOtherReason('');
                              setCancellationDialogOpen(true);
                            }}
                            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors duration-200"
                          >
                            Request Cancellation
                          </Button>
                        )}
                        {/* Admin can still delete orders */}
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDeleteDialogOpen(true);
                            }}
                            className="hover:bg-destructive/90 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin buttons for handling cancellation requests */}
                  {isAdmin && order.status === 'cancellation_requested' && (
                    <div className='flex justify-end gap-2 flex-wrap mt-2'>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set the selected order first, then handle the response
                          setSelectedOrder(order);
                          // Use setTimeout to ensure state is updated before the handler runs
                          setTimeout(() => handleCancellationResponse(true), 0);
                        }}
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-300 hover:text-green-700"
                      >
                        Approve Cancellation
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Set the selected order first, then handle the response
                          setSelectedOrder(order);
                          // Use setTimeout to ensure state is updated before the handler runs
                          setTimeout(() => handleCancellationResponse(false), 0);
                        }}
                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-300 hover:text-red-700"
                      >
                        Reject Cancellation
                      </Button>
                    </div>
                  )}

                  {/* Show cancellation reason directly */}
                  {order.status === 'cancellation_requested' && order.cancellationReason && (
                    <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-none border border-orange-200 dark:border-orange-900/50">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-orange-600 dark:text-orange-400">Cancellation Reason:</span>{' '}
                          <span className="text-orange-700 dark:text-orange-300">{order.cancellationReason}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-3 rounded-none">
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-primary">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.productCode || `item-${Math.random().toString(36).substr(2, 9)}`} className="flex items-center gap-3 bg-card p-2 rounded-none shadow-sm">
                            <div className="relative w-14 h-14 rounded-none overflow-hidden border">
                              <Image
                                src={item.image || "/images/product-placeholder.png"}
                                alt={item.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × {item.price !== undefined ? item.price.toFixed(2) : '0.00'} Tk
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 text-primary">Order Details</h4>
                      <div className="bg-card p-3 rounded-none shadow-sm space-y-2 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold text-primary">{order.total !== undefined ? order.total.toFixed(2) : '0.00'} Tk</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment Method:</span>
                          <span className='uppercase'>{order.payment?.method || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment Status:</span>
                          <span className="font-medium capitalize">{order?.status || 'N/A'}</span>
                        </div>
                        {order.payment?.transactionId && (
                          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center text-xs">
                            <span>Transaction ID:</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded mt-1 xs:mt-0 break-all">{order.payment.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200 group"
                    >
                      <Eye className="h-4 w-4 mr-2 group-hover:text-primary" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          (p >= pagination.page - 1 && p <= pagination.page + 1)
                        )
                        .map((p, i, arr) => (
                          <React.Fragment key={`page-${p}`}>
                            {i > 0 && arr[i - 1] !== p - 1 && (
                              <span key={`ellipsis-${p}`} className="px-2">...</span>
                            )}
                            <Button
                              variant={pagination.page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(p)}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-red-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}
              className="hover:bg-slate-100 transition-colors duration-200">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={deleteOrder.isPending}
              className="bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow"
            >
              {deleteOrder.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="border-violet-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-violet-600 flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Update Order Status
            </DialogTitle>
            <DialogDescription>
              Select the new status for this order.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(extendedOrderStatuses).map(([value, { label }]) => (
                  <SelectItem key={`dialog-status-${value}`} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}
              className="hover:bg-slate-100 transition-colors duration-200">
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateOrderStatus.isPending || updatingStatus}
              className="bg-violet-600 text-white hover:bg-violet-700 transition-all duration-200 shadow-sm hover:shadow"
            >
              {updateOrderStatus.isPending || updatingStatus ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Request Dialog */}
      <Dialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
        <DialogContent className="border-red-100 shadow-lg max-w-[95vw] sm:max-w-[600px] w-full">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Request Order Cancellation
            </DialogTitle>
            <DialogDescription>
              You can only request cancellation within 6 hours of placing an order. Please provide a reason for your cancellation request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-base">Reason for cancellation</Label>
              <RadioGroup value={cancellationReason} onValueChange={setCancellationReason} className="space-y-2">
                {cancellationReasons.map(reason => (
                  <div key={reason.replace(/\s+/g, '-').toLowerCase()} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason} id={reason.replace(/\s+/g, '-').toLowerCase()} />
                    <Label htmlFor={reason.replace(/\s+/g, '-').toLowerCase()}>{reason}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            {cancellationReason === "Other (please specify)" && (
              <div className="space-y-2">
                <Label htmlFor="other-reason">Please specify your reason</Label>
                <Textarea 
                  id="other-reason" 
                  value={otherReason} 
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please provide details about why you want to cancel this order..."
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button variant="outline" onClick={() => setCancellationDialogOpen(false)}
              className="hover:bg-slate-100 transition-colors duration-200 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancellationRequest}
              disabled={submittingCancellation || !cancellationReason || (cancellationReason === "Other (please specify)" && !otherReason.trim())}
              className="bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow w-full sm:w-auto"
            >
              {submittingCancellation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Cancellation Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] h-auto overflow-hidden flex flex-col border-border shadow-lg max-w-[95vw] w-full">
          <DialogHeader className="flex-shrink-0 pb-2 border-b border-border">
            <DialogTitle className="text-primary flex items-center text-xl">
              <Package className="h-5 w-5 mr-2" />
              {loadingDetails ? 'Loading Order Details...' :
                `Order #${selectedOrder?._id.slice(-6).toUpperCase() || ''}`}
            </DialogTitle>
            <DialogDescription>
              Complete information about your order
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto pr-1 flex-grow custom-scrollbar"
            style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {loadingDetails ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : detailsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{detailsError}</AlertDescription>
              </Alert>
            ) : orderDetails ? (
              <div className="space-y-6 p-1">
                {/* Status Badge */}
                <div className="flex justify-center mb-2">
                  <Badge className={`${extendedOrderStatuses[orderDetails.status]?.color || 'bg-gray-500'} text-white font-medium px-6 py-1.5 rounded-full text-sm`}>
                    {extendedOrderStatuses[orderDetails.status]?.label || orderDetails.status}
                  </Badge>
                </div>

                {/* Admin sees customer details */}
                {isAdmin && orderDetails.user && (
                  <div className="bg-muted/50 rounded-none p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-primary">
                      <User className="h-4 w-4 mr-2" />
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm pl-4 border-l-2 border-primary/20">
                      <p><span className="font-medium">Name:</span> {orderDetails.user.name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {orderDetails.user.email || 'N/A'}</p>
                      {orderDetails.payment?.paymentNumber && <p><span className="font-medium">Phone:</span> {orderDetails.payment?.paymentNumber}</p>}
                      <p><span className="font-medium">Account Type:</span> {orderDetails.user.role || 'customer'}</p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-none">
                  <div>
                    <p className="font-medium text-primary">Ordered On:</p>
                    <p>{new Date(orderDetails.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">Last Updated:</p>
                    <p>{new Date(orderDetails.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-card border border-border rounded-none shadow-sm">
                  <h3 className="text-lg font-semibold p-4 border-b border-border text-primary">Items</h3>
                  <div className="p-4 space-y-4">
                    {orderDetails.items.map((item) => (
                      <div key={item.id || item.productCode || `detail-${Math.random().toString(36).substr(2, 9)}`} className="flex flex-col sm:flex-row items-start gap-4 border-b border-border pb-4 hover:bg-muted/30 p-2 rounded-none transition-colors duration-200">
                        <div className="relative w-16 h-16 rounded-none overflow-hidden border border-border flex-shrink-0 mx-auto sm:mx-0 shadow-sm">
                          <Image
                            src={item.image || "/images/product-placeholder.png"}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow w-full text-center sm:text-left">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-muted-foreground">
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: {item.price !== undefined ? item.price.toFixed(2) : '0.00'} Tk</p>
                          </div>
                          {item.size && <p className="text-sm">Size: {item.size}</p>}
                          {item.color && <p className="text-sm">Color: {item.color}</p>}
                        </div>
                        <div className="font-medium w-full sm:w-auto text-center sm:text-right mt-2 sm:mt-0 text-primary">
                          {(item.quantity && item.price) ? (item.quantity * item.price).toFixed(2) : '0.00'} Tk
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Combo Items - Display if any combo products exist in the order */}
                {orderDetails.items.some(item => item.isCombo) && (
                  <div className="bg-card border border-border rounded-none shadow-sm">
                    <h3 className="text-lg font-semibold p-4 border-b border-border text-primary">Combo Details</h3>
                    <div className="p-4 space-y-6">
                      {orderDetails.items
                        .filter(item => item.isCombo)
                        .map((combo, comboIndex) => (
                          <div key={`combo-${comboIndex}-${combo.id || ''}`} className="border border-border p-4 rounded-none">
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-border">
                              <div className="relative w-12 h-12 rounded-none overflow-hidden border border-border flex-shrink-0">
                                <Image
                                  src={combo.image || '/images/product-placeholder.png'}
                                  alt={combo.name || "Combo product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{combo.name}</h4>
                                <p className="text-sm text-muted-foreground">Quantity: {combo.quantity}</p>
                              </div>
                              <div className="ml-auto font-medium text-primary">
                                {combo.price ? (combo.price * combo.quantity).toFixed(2) : '0.00'} Tk
                              </div>
                            </div>
                            
                            {combo.products && combo.products.length > 0 && (
                              <div className="pl-4 space-y-3">
                                <p className="text-sm font-medium text-primary mb-2">Products in this combo:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {combo.products.map((comboProduct, productIndex) => (
                                    <div key={`combo-product-${productIndex}-${combo.id || comboIndex}`} className="flex items-center gap-2 bg-muted/30 p-2 rounded-none">
                                      <div className="relative w-10 h-10 rounded-none overflow-hidden border border-border flex-shrink-0">
                                        <Image
                                          src={comboProduct.image || '/images/product-placeholder.png'}
                                          alt={comboProduct.name || "Product"}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{comboProduct.name}</p>
                                        {comboProduct.size && <p className="text-xs text-muted-foreground">Size: {comboProduct.size}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="bg-card border border-border rounded-none shadow-sm">
                  <h3 className="text-lg font-semibold p-4 border-b border-border text-primary">Payment Information</h3>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="font-medium">Method:</span>
                      <span className='uppercase'>{orderDetails.payment?.method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <span className="font-medium">Status:</span>
                      <div className="flex justify-center mb-2">
                        <Badge className={`${extendedOrderStatuses[orderDetails.status]?.color || 'bg-gray-500'} text-white font-medium px-4 py-1 rounded-none text-sm`}>
                          {extendedOrderStatuses[orderDetails.status]?.label || orderDetails.status}
                        </Badge>
                      </div>
                    </div>
                    {orderDetails.payment?.transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Transaction ID:</span>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{orderDetails.payment.transactionId}</span>
                      </div>
                    )}
                    {isAdmin && orderDetails.payment?.paymentScreenshot && (
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="font-medium mb-2">Payment Screenshot:</p>
                        <div className="relative w-full h-48 rounded-none overflow-hidden border border-border shadow-sm">
                          <Image
                            src={orderDetails.payment.paymentScreenshot || "/images/product-placeholder.png"}
                            alt="Payment Screenshot"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="bg-muted/50 p-4 rounded-none shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2">
                      <span>Subtotal:</span>
                      <span>{orderDetails.subtotal !== undefined ? orderDetails.subtotal.toFixed(2) : '0.00'} Tk</span>
                    </div>
                    {orderDetails.shipping && orderDetails.shipping.info && orderDetails.shipping.price !== undefined && (
                      <div className="flex justify-between items-center pb-2">
                        <span>Shipping:</span>
                        <span>{orderDetails.shipping.price.toFixed(2)} Tk</span>
                      </div>
                    )}
                    {orderDetails.discount !== undefined && orderDetails.discount > 0 && (
                      <div className="flex justify-between items-center pb-2">
                        <span>Discount:</span>
                        <span>-{orderDetails.discount.toFixed(2)} Tk</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-primary/20">
                      <span>Total:</span>
                      <span className="text-primary">{orderDetails.total !== undefined ? orderDetails.total.toFixed(2) : '0.00'} Tk</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                {orderDetails.shipping && (
                  <div className="bg-card border border-border rounded-none shadow-sm">
                    <h3 className="text-lg font-semibold p-4 border-b border-border text-primary">Shipping Information</h3>
                    <div className="p-4 space-y-3 text-sm">
                      {/* Shipping Method */}
                      {orderDetails.shipping.info && (
                        <>
                          {/* Shipping Name/Region */}
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="font-medium">Shipping Region:</span>
                            <span className="text-primary font-medium">{orderDetails.shipping.name || 'Standard Shipping'}</span>
                          </div>

                          {/* Shipping Cost */}
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="font-medium">Shipping Cost:</span>
                            <span className="font-medium text-primary">
                              {orderDetails.shipping.info.price !== undefined
                                ? `${orderDetails.shipping.info.price.toFixed(2)} Tk`
                                : 'Included'}
                            </span>
                          </div>

                          {/* Delivery Time */}
                          {orderDetails.shipping.info.deliveryTime && (
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                              <span className="font-medium">Estimated Delivery:</span>
                              <span>{orderDetails.shipping.info.deliveryTime}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Shipping Address */}
                      {orderDetails.shipping.info && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">Shipping Address:</p>
                          <div className="bg-muted/50 p-4 rounded-none space-y-2">
                            {/* Address */}
                            {orderDetails.shipping.info.address && (
                              <p>
                                <span className="font-medium inline-block w-24">Address:</span>
                                {orderDetails.shipping.info.address}
                              </p>
                            )}

                            {/* City, State, Zip */}
                            <div className="flex flex-wrap">
                              {orderDetails.shipping.info.city && (
                                <p className="mr-4">
                                  <span className="font-medium w-24">City: </span>
                                  {orderDetails.shipping.info.city}
                                </p>
                              )}

                              {orderDetails.shipping.info.state && (
                                <p className="mr-4">
                                  <span className="font-medium  w-24">State: </span>
                                  {orderDetails.shipping.info.state}
                                </p>
                              )}

                              {orderDetails.shipping.info.zipCode && (
                                <p>
                                  <span className="font-mediu w-24">Zip Code: </span>
                                  {orderDetails.shipping.info.zipCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Shipping Address (old format) */}
                      {!orderDetails.shipping.info && orderDetails.shipping.address && (
                        <div className="mt-3">
                          <p className="font-medium mb-2">Delivery Address:</p>
                          <div className="bg-muted/50 p-3 rounded-none">
                            <p className="whitespace-pre-line">{orderDetails.shipping.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Tracking Number */}
                      {orderDetails.shipping.trackingNumber && (
                        <div className="flex justify-between items-center pb-2 border-b border-border">
                          <span className="font-medium">Tracking Number:</span>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{orderDetails.shipping.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Notes Section */}
                {isAdmin && (
                  <div className="bg-card border border-border rounded-none shadow-sm">
                    <h3 className="text-lg font-semibold p-4 border-b border-border text-primary">Admin Notes</h3>
                    <div className="p-4 space-y-1 text-sm">
                      <p className="text-xs text-muted-foreground mb-2">Private notes about this order (only visible to admin)</p>
                      <textarea
                        className="w-full border border-input rounded-none p-2 h-24 text-sm focus:border-primary/30 focus:ring focus:ring-primary/10 focus:outline-none bg-background"
                        placeholder="Add notes about this order (only visible to admins)"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveNotes}
                          disabled={savingNotes}
                          className="hover:bg-primary/5 hover:border-primary/20"
                        >
                          {savingNotes ? (
                            <>
                              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                              Saving...
                            </>
                          ) : 'Save Notes'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add cancellation request info section when applicable */}
                {orderDetails.status === 'cancellation_requested' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-none p-4 shadow-sm dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-100">
                    <h3 className="text-lg font-semibold mb-2 text-orange-700 flex items-center dark:text-orange-300">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cancellation Request
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium dark:text-orange-300">Requested on:</span> {new Date(orderDetails.cancellationRequestedAt).toLocaleString()}</p>
                      <p><span className="font-medium dark:text-orange-300">Reason:</span> {orderDetails.cancellationReason}</p>
                      {isAdmin && (
                        <div className="pt-3 flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // We can use selectedOrder here directly since it's already set
                              handleCancellationResponse(true);
                            }}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-800/50"
                          >
                            Approve Cancellation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // We can use selectedOrder here directly since it's already set
                              handleCancellationResponse(false);
                            }}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-800/50"
                          >
                            Reject Cancellation
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show cancellation history if the order was cancelled */}
                {orderDetails.status === 'cancelled' && orderDetails.cancellationReason && (
                  <div className="bg-red-50 border border-red-200 rounded-none p-4 shadow-sm dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-100">
                    <h3 className="text-lg font-semibold mb-2 text-red-700 flex items-center dark:text-red-300">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Order Cancelled
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium dark:text-red-300">Reason:</span> {orderDetails.cancellationReason}</p>
                      {orderDetails.cancellationRequestedAt && (
                        <p><span className="font-medium dark:text-red-300">Requested on:</span> {new Date(orderDetails.cancellationRequestedAt).toLocaleString()}</p>
                      )}
                      {orderDetails.cancellationRespondedAt && (
                        <p><span className="font-medium dark:text-red-300">Processed on:</span> {new Date(orderDetails.cancellationRespondedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No order details available
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex-shrink-0 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}
              className="hover:bg-muted/50 transition-colors duration-200 px-6">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 