"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, ArrowRight, Check, Clock, Phone, Search } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAuth } from '@/hooks/use-auth';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const { isAuthenticated } = useAuth();
  const [showConfetti, setShowConfetti] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Stop confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get payment method and order ID from sessionStorage and clear coupon
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear coupon
      sessionStorage.removeItem('appliedCoupon');
      
      // Get payment method if stored
      const method = sessionStorage.getItem('payment_method');
      if (method) {
        setPaymentMethod(method);
        // Clear it after retrieving
        sessionStorage.removeItem('payment_method');
      }
      
      // First try to get the short order ID format
      const shortOrderId = sessionStorage.getItem('short_order_id');
      if (shortOrderId) {
        setOrderId(shortOrderId);
        // Clear it after retrieving
        sessionStorage.removeItem('short_order_id');
      } else {
        // Try to get the full order ID and convert to short format
        const fullOrderId = sessionStorage.getItem('last_order_id');
        if (fullOrderId) {
          // Format as ORD-XXXXXX where XXXXXX is the last 6 chars of the ObjectID
          const shortId = 'ORD-' + fullOrderId.slice(-6);
          setOrderId(shortId);
          // Clear it after retrieving
          sessionStorage.removeItem('last_order_id');
        } else {
          // Fallback to random ID if not found
          setOrderId('ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase());
        }
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Congratulations! Your Order is Successful!</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {paymentMethod === 'bkash' || paymentMethod === 'nagad' 
              ? 'Thank you for your purchase. Your order has been placed and is awaiting payment verification.'
              : 'Thank you for your purchase. Your order has been placed and is being processed.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left Column */}
          <div>
            <Card className="border-2 h-full">
              <CardHeader>
                <CardTitle>Order #{orderId}</CardTitle>
                <CardDescription>
                  {paymentMethod === 'bkash' || paymentMethod === 'nagad'
                    ? 'Order confirmation has been sent to your email. You will receive another email once payment is verified.'
                    : 'Order confirmation and details have been sent to your email.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated && (
                  <div className="bg-primary/10 rounded-lg p-4 text-left border-l-4 border-primary">
                    <h3 className="font-medium mb-1 text-primary">Important: Save Your Order ID</h3>
                    <p className="text-sm">
                      Please save or write down your order ID: <span className="font-bold">{orderId}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll need this ID to track your order status since you checked out as a guest.
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-1">View Your Order Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated 
                      ? "You can view all details about your order, including status updates, in your account's Orders tab. Visit your Orders tab to track delivery progress and manage your purchase."
                      : "You can track your order status using your Order ID. Use the Track Order button below to check your order status anytime."}
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-1">What happens next?</h3>
                  {paymentMethod === 'bkash' || paymentMethod === 'nagad' ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Our team will verify your payment for {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} transaction. This usually takes 1-2 hours during business hours.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Once payment is verified, we'll begin processing your order and you'll receive an update via email.
                      </p>
                    </div>
                  ) : paymentMethod === 'cod' ? (
                    <p className="text-sm text-muted-foreground">
                      We're preparing your order for shipment. You'll receive an email once your order has been shipped. Please have the exact amount ready for payment upon delivery.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      We're preparing your order for shipment. You'll receive an email once your order has been shipped.
                    </p>
                  )}
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium">Track Your Order</h4>
                    <p className="text-sm text-muted-foreground">
                      {isAuthenticated
                        ? "You can track your order status from your account dashboard."
                        : "You can track your order status using the Track Order button below."}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 mt-auto">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-none" asChild>
                  {isAuthenticated ? (
                    <Link href="/account?tab=orders">
                      View Your Orders
                      <Package className="ml-2 h-4 w-4" />
                    </Link>
                  ) : (
                    <Link href={`/track-order?id=${orderId}`}>
                      Track Your Order
                      <Search className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right Column */}
          <div>
            <Card className="border-2 h-full">
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
                <CardDescription>
                  Please review the following details about your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    Order Cancellation Policy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You can cancel your order within <span className="font-medium">3 hours</span> of placing it 
                    {isAuthenticated ? " through your account dashboard" : " by contacting our customer support with your order ID"}.
                    After this window, cancellation requests will be subject to review.
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    Order Inquiries
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our team may reach out to you if we need additional information about your order. 
                    Feel free to contact our customer support if you have any questions.
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium">Need Help?</h4>
                    <p className="text-sm text-muted-foreground">
                      If you have any questions about your order, please contact our customer support.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full rounded-none" asChild>
                  <Link href="/store">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 