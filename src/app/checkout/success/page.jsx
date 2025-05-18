"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, Home, ArrowRight, Check } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [orderId] = useState(() => 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Stop confetti after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get payment method from sessionStorage and clear coupon
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
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
          <p className="text-muted-foreground mb-8">
            {paymentMethod === 'bkash' || paymentMethod === 'nagad' 
              ? 'Thank you for your purchase. Your order has been placed and is awaiting payment verification.'
              : 'Thank you for your purchase. Your order has been placed and is being processed.'}
          </p>
          
          <Card>
            <CardHeader>
              <CardTitle>Order #{orderId}</CardTitle>
              <CardDescription>
                {paymentMethod === 'bkash' || paymentMethod === 'nagad'
                  ? 'Order confirmation has been sent to your email. You will receive another email once payment is verified.'
                  : 'Order confirmation and details have been sent to your email.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h3 className="font-medium mb-1">What happens next?</h3>
                <p className="text-sm text-muted-foreground">
                  We're preparing your order for shipment. You'll receive an email once your order has been shipped.
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
              
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium">Track Your Order</h4>
                    <p className="text-sm text-muted-foreground">
                      You can track your order status from your account dashboard.
                    </p>
                  </div>
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
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/account?tab=orders">
                  View Orders
                  <Package className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 