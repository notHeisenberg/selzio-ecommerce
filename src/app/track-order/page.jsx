"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Package, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Create a client component that uses useSearchParams
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Get order ID from URL if available
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setOrderId(id);
      handleTrackOrder(id);
    }
  }, [searchParams]);

  // Track order function
  const handleTrackOrder = async (id = orderId) => {
    if (!id) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID to track your order.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Call the API to get order details
      const response = await axios.get(`/api/orders/track?id=${id}`);
      
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      } else {
        setError('Order not found. Please check your order ID and try again.');
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      setError(error.response?.data?.error || 'Failed to track order. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get status icon based on order status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-indigo-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'awaiting_payment_verification':
        return <Clock className="h-6 w-6 text-amber-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get status text based on order status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is pending processing.';
      case 'processing':
        return 'Your order is being processed and prepared for shipment.';
      case 'shipped':
        return 'Your order has been shipped and is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      case 'awaiting_payment_verification':
        return 'We are verifying your payment. This usually takes 1-2 hours during business hours.';
      default:
        return 'Status information unavailable.';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order ID to track the status of your order
            </p>
          </div>

          {/* Track Order Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Order ID</CardTitle>
              <CardDescription>
                Please enter the order ID that was provided to you after checkout (e.g., ORD-686E2A)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="e.g., ORD-686E2A"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleTrackOrder()} 
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Tracking...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      Track Order
                    </span>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <p className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {order && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order #{order._id}</CardTitle>
                    <CardDescription>
                      Placed on {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Order Status</h3>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <div className="ml-3">
                      <p className="font-medium capitalize">{order.status.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{getStatusText(order.status)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center border-b pb-3 last:border-0">
                        <div className="h-16 w-16 bg-muted rounded-md overflow-hidden mr-4">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <p>Qty: {item.quantity}</p>
                            <p>{item.price} Tk</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Shipping Address</h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium">{order.shipping?.info?.name}</p>
                      <p>{order.shipping?.info?.address}</p>
                      <p>{order.shipping?.info?.city}</p>
                      <p>{order.shipping?.info?.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{order.subtotal || order.summary?.subtotal} Tk</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{order.shipping?.price || order.summary?.shippingCost || 0} Tk</span>
                      </div>
                      {(order.discount > 0 || order.summary?.discount > 0) && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{order.discount || order.summary?.discount} Tk</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total:</span>
                        <span>{order.total || order.summary?.total} Tk</span>
                      </div>
                      <div className="text-sm text-muted-foreground pt-1">
                        Paid via: <span className="font-medium text-primary uppercase">{order.payment?.method || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Order Timeline</h3>
                    <div className="space-y-4">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="flex">
                          <div className="mr-4 relative">
                            <div className="h-8 w-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                              {getStatusIcon(event.status)}
                            </div>
                            {index < order.timeline.length - 1 && (
                              <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -ml-px bg-muted-foreground/20 h-full" />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="font-medium capitalize">{event.status.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                            {event.note && <p className="mt-1 text-sm">{event.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                {order.shipping?.trackingNumber && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Tracking Information</h3>
                    <p className="font-medium">Tracking Number: {order.shipping.trackingNumber}</p>
                    {order.shipping.courier && (
                      <p className="text-sm">Courier: {order.shipping.courier}</p>
                    )}
                    {order.shipping.trackingUrl && (
                      <Button variant="link" className="px-0 py-1" asChild>
                        <a href={order.shipping.trackingUrl} target="_blank" rel="noopener noreferrer">
                          Track with courier
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Main page component with Suspense boundary
export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Loading...</h1>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
} 