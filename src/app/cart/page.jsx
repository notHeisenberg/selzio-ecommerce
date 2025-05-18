"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, RefreshCw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import CheckoutAuthDialog from '@/components/auth/checkout-auth-dialog';

// Coupon codes - In a real app, these would come from the database
const VALID_COUPONS = {
  'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
  'FREESHIP': { discount: 5.99, type: 'fixed', description: 'Free standard shipping' },
};

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { cartItems, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Shipping cost calculation
  const baseShippingCost = 5.99;
  const freeShippingThreshold = 50;
  const qualifiesForFreeShipping = totalPrice >= freeShippingThreshold;
  
  // Calculate shipping cost based on free shipping qualification and coupon
  const getShippingCost = () => {
    if (qualifiesForFreeShipping) return 0;
    if (appliedCoupon?.type === 'fixed' && appliedCoupon?.discount === baseShippingCost) return 0;
    return baseShippingCost;
  };
  
  const shippingCost = getShippingCost();

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return totalPrice * appliedCoupon.discount;
    } else if (appliedCoupon.type === 'fixed') {
      // If it's a shipping coupon, don't count it as a discount on items
      return appliedCoupon.discount === baseShippingCost ? 0 : appliedCoupon.discount;
    }
    
    return 0;
  };
  
  const discountAmount = getDiscountAmount();
  
  // Calculate grand total
  const grandTotal = totalPrice - discountAmount;
  
  // Handle applying coupon code
  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError('');
    
    // Simulate API call
    setTimeout(() => {
      const normalizedCode = couponCode.trim().toUpperCase();
      
      if (VALID_COUPONS[normalizedCode]) {
        setAppliedCoupon({
          code: normalizedCode,
          ...VALID_COUPONS[normalizedCode]
        });
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code');
        setAppliedCoupon(null);
      }
      
      setIsApplyingCoupon(false);
    }, 800);
  };
  
  // Handle removing coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };
  
  // Store coupon data in sessionStorage for the shared dialog to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (appliedCoupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      } else {
        sessionStorage.removeItem('appliedCoupon');
      }
    }
  }, [appliedCoupon]);
  
  // Proceed to checkout handler
  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
    } else {
      setShowAuthDialog(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Cart Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {totalItems > 0 
                ? `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart`
                : 'Your cart is empty'}
            </p>
          </div>
          
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`overflow-hidden ${mounted && resolvedTheme === 'dark' ? 'border-gray-800' : ''}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          <div className={`relative w-full sm:w-40 h-40 ${mounted && resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-secondary/10'}`}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4 flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-medium text-base sm:text-lg mb-1">{item.name}</h3>
                              <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                              <div className="text-primary font-semibold text-lg mb-2">${item.price.toFixed(2)}</div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full shadow-sm transition-all duration-200
                                    ${mounted && resolvedTheme === 'dark'
                                      ? 'border-gray-600 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                                      : 'border-border hover:border-primary/30 hover:bg-secondary hover:text-primary'
                                    }`}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full shadow-sm transition-all duration-200
                                    ${mounted && resolvedTheme === 'dark'
                                      ? 'border-gray-600 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                                      : 'border-border hover:border-primary/30 hover:bg-secondary hover:text-primary'
                                    }`}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-base font-semibold text-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full transition-all duration-200
                                    ${mounted && resolvedTheme === 'dark'
                                      ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                      : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                                    }`}
                                  onClick={() => removeItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Continue Shopping Button */}
                <div className="flex justify-start pt-4">
                  <Button 
                    variant="outline" 
                    className="group"
                    asChild
                  >
                    <Link href="/store">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-5">
                  <Card className={mounted && resolvedTheme === 'dark' ? 'border-gray-800' : ''}>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                      <CardDescription>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Coupon Code */}
                      {!appliedCoupon ? (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">Have a coupon code?</div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="h-9"
                            />
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-9 whitespace-nowrap"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || isApplyingCoupon}
                            >
                              {isApplyingCoupon ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Applying...
                                </>
                              ) : 'Apply'}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-destructive">{couponError}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Try WELCOME10 for 10% off or FREESHIP for free shipping
                          </div>
                        </div>
                      ) : (
                        <div className="bg-primary/10 rounded-lg p-3 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium text-sm">{appliedCoupon.code}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="xs" 
                              className="h-7 text-xs text-muted-foreground hover:text-destructive"
                              onClick={handleRemoveCoupon}
                            >
                              Remove
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{appliedCoupon.description}</p>
                        </div>
                      )}
                      
                      {/* Free Shipping Alert */}
                      {!qualifiesForFreeShipping && (
                        <Alert variant="info" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50">
                          <AlertTitle className="flex items-center text-sm font-medium">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Free Shipping
                          </AlertTitle>
                          <AlertDescription className="text-xs mt-1">
                            Add ${(freeShippingThreshold - totalPrice).toFixed(2)} more to qualify for free shipping!
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Separator />
                      
                      {/* Price Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span className="font-medium">${totalPrice.toFixed(2)}</span>
                        </div>
                        
                        {appliedCoupon && appliedCoupon.type === 'percentage' && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>Discount ({appliedCoupon.discount * 100}%)</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {appliedCoupon && appliedCoupon.type === 'fixed' && appliedCoupon.discount !== baseShippingCost && (
                          <div className="flex justify-between text-sm text-primary">
                            <span>Discount</span>
                            <span>-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span>Shipping</span>
                          <span className="text-primary">Calculated at checkout</span>
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-primary">${grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          Shipping costs will be calculated at checkout
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Button 
                        className="w-full group shadow-md hover:shadow-lg transform hover:translate-y-[-1px] transition-all duration-200"
                        onClick={handleCheckout}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                      
                      {!isAuthenticated && (
                        <p className="text-xs text-center text-muted-foreground">
                          You'll have the option to log in or create an account during checkout
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 max-w-lg mx-auto">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6
                ${mounted && resolvedTheme === 'dark'
                  ? 'bg-gray-800'
                  : 'bg-secondary/30'
                }`}
              >
                <ShoppingBag className={`h-10 w-10 
                  ${mounted && resolvedTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-slate-400'
                  }`} 
                />
              </div>
              <h2 className="text-2xl font-bold text-center mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground text-center mb-8">
                Looks like you haven't added any items to your cart yet. Browse our store to find something you'll love.
              </p>
              <Button 
                size="lg"
                className={`px-8 group
                  ${mounted && resolvedTheme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                  }`}
                asChild
              >
                <Link href="/store">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Use the shared auth dialog component */}
      <CheckoutAuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          // Close the auth dialog after successful login/registration
          setShowAuthDialog(false);
          
          // The auth dialog will handle the redirect timing and coupon data saving
          // No need to do anything else here - this simplifies the callback
        }}
        redirectUrl="/checkout"
      />
    </div>
  );
} 