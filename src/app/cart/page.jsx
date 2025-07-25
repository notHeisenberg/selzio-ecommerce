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
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, getDiscountedPrice } from "@/lib/utils";

// Coupon codes - In a real app, these would come from the database
const VALID_COUPONS = {
  'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
  'FREESHIP': { discount: 5.99, type: 'fixed', description: 'Free standard shipping' },
};

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { cartItems, updateQuantity, removeItem, totalItems, totalPrice, isInitialized } = useCart();
  const { isAuthenticated } = useAuth();

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Calculate combined loading state
  const showLoading = isLoading || !isInitialized;

  // Avoid hydration mismatch and ensure cart data is fully loaded
  useEffect(() => {
    // Initial setup - don't show content until fully mounted and loaded
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setMounted(true);
      setIsLoading(false);
    }, 300); // Short delay to ensure cart data is properly loaded from localStorage
    
    // Load coupon from sessionStorage
    if (typeof window !== 'undefined') {
      const couponData = window.sessionStorage.getItem('appliedCoupon');
      if (couponData) {
        try {
          setAppliedCoupon(JSON.parse(couponData));
        } catch (error) {
          console.error('Error parsing coupon data:', error);
          sessionStorage.removeItem('appliedCoupon');
        }
      }
    }
    
    return () => clearTimeout(timer);
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
        
        // Store in session storage for cart drawer to access
        sessionStorage.setItem('appliedCoupon', JSON.stringify({
          code: normalizedCode,
          ...VALID_COUPONS[normalizedCode]
        }));
      } else {
        setCouponError('Invalid coupon code');
        setAppliedCoupon(null);
        sessionStorage.removeItem('appliedCoupon');
      }
      
      setIsApplyingCoupon(false);
    }, 800);
  };
  
  // Handle removing coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    sessionStorage.removeItem('appliedCoupon');
  };
  
  // Handle checkout button click - direct to checkout without auth
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Cart Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            {showLoading ? (
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
            ) : (
              <p className="text-muted-foreground">
                {totalItems > 0 
                  ? `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your cart`
                  : 'Your cart is empty'}
              </p>
            )}
          </motion.div>
          
          {showLoading ? (
            // Loading skeleton for cart items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2].map((i) => (
                  <div key={`loading-${i}`} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-40 animate-pulse"></div>
                ))}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-96 animate-pulse"></div>
            </div>
          ) : cartItems.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Cart Items */}
              <motion.div 
                variants={containerVariants}
                className="lg:col-span-2 space-y-6"
              >
                {/* Items List */}
                <AnimatePresence>
                  <motion.div variants={containerVariants} className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div 
                        key={`${item.isCombo ? `combo-${item.comboCode}` : `product-${item.productCode}-${item.selectedSize || 'default'}`}`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Card 
                          className={`overflow-hidden ${mounted && resolvedTheme === 'dark' ? 'border-gray-800' : ''}`}
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row">
                              <motion.div 
                                className={`relative w-full sm:w-40 aspect-square ${mounted && resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-secondary/10'}`}
                                whileHover={{ scale: 1.03 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                {typeof item.image === 'string' && item.image !== '' ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name || 'Product'}
                                    fill
                                    sizes="(max-inline-size: 768px) 100vw, (max-inline-size: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                    onError={(e) => {
                                      // If image fails to load, show fallback UI
                                      e.target.style.display = 'none';
                                      e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                                      const fallback = document.createElement('div');
                                      fallback.className = 'text-2xl font-semibold text-muted-foreground';
                                      fallback.innerText = item.name?.substring(0, 1) || 'P';
                                      e.target.parentNode.appendChild(fallback);
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                                    <span className="text-2xl font-semibold text-muted-foreground">
                                      {item.name?.substring(0, 1) || 'P'}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                              <div className="flex-1 p-4 flex flex-col">
                                <div className="flex-1">
                                  <h3 className="font-medium text-base sm:text-lg mb-1">{item.name}</h3>
                                  
                                  {/* Display description */}
                                  {item.shortDescription || item.description ? (
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                      {item.shortDescription 
                                        ? (typeof item.shortDescription === 'string' && item.shortDescription.startsWith('<') 
                                          ? item.shortDescription.replace(/<[^>]*>/g, '') 
                                          : item.shortDescription)
                                        : (typeof item.description === 'string' && item.description.startsWith('<') 
                                          ? item.description.replace(/<[^>]*>/g, '') 
                                          : item.description)}
                                    </p>
                                  ) : (
                                    <p className="text-muted-foreground text-sm mb-4">No description available</p>
                                  )}
                                  
                                  {/* Display price with discount if available */}
                                  {item.discount && item.discount > 0 ? (
                                    <div className="mb-2">
                                      <div className="text-primary font-semibold text-lg">
                                        {getDiscountedPrice(item.price, item.discount).toFixed(2)} BDT
                                      </div>
                                      <div className="text-muted-foreground text-sm line-through">
                                        {item.price.toFixed(2)} BDT
                                      </div>
                                      <div className="text-sm text-green-600 dark:text-green-400">
                                        You save {item.discount}% ({(item.price - getDiscountedPrice(item.price, item.discount)).toFixed(2)} BDT)
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-primary font-semibold text-lg mb-2">{item.price.toFixed(2)} BDT</div>
                                  )}
                                  
                                  {/* Display size if available */}
                                  {item.selectedSize && (
                                    <div className="mb-2">
                                      <span className="text-sm font-medium">Size:</span>
                                      <span className="text-sm ml-1">({item.selectedSize})</span>
                                      {item.sizeStock !== undefined && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {item.sizeStock > 0 
                                            ? `(${item.sizeStock} in stock)` 
                                            : '(Low stock)'}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Show combo items */}
                                  {item.isCombo && item.products && item.products.length > 0 && (
                                    <div className="mb-3 p-2 bg-secondary/20 rounded-md">
                                      <p className="text-sm font-medium mb-1">Combo includes:</p>
                                      <ul className="list-disc pl-5 space-y-0.5">
                                        {item.products.map((product, idx) => (
                                          <li key={idx} className="text-sm text-muted-foreground">
                                            {product.name} {product.size && `(${product.size})`}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <motion.div 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="shadow-sm"
                                    >
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className={`h-8 w-8 rounded-md shadow-sm transition-all duration-200
                                          ${mounted && resolvedTheme === 'dark'
                                            ? 'border-gray-600 hover:bg-gray-700 hover:text-blue-400'
                                            : 'border-border hover:bg-secondary hover:text-primary'
                                          }`}
                                        onClick={() => updateQuantity(
                                          item.isCombo ? item.comboCode : item.productCode, 
                                          item.quantity - 1, 
                                          item.selectedSize
                                        )}
                                        disabled={item.quantity <= 1}
                                      >
                                        <Minus key={`minus-${item.productCode}`} className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                    <motion.span 
                                      key={`qty-${item.isCombo ? item.comboCode : item.productCode}-${item.selectedSize}-${item.quantity}`}
                                      initial={{ scale: 1.2 }}
                                      animate={{ scale: 1 }}
                                      className="text-sm font-medium w-8 text-center text-foreground"
                                    >
                                      {item.quantity}
                                    </motion.span>
                                    <motion.div 
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="shadow-sm"
                                    >
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className={`h-8 w-8 rounded-md shadow-sm transition-all duration-200
                                          ${mounted && resolvedTheme === 'dark'
                                            ? 'border-gray-600 hover:bg-gray-700 hover:text-blue-400'
                                            : 'border-border hover:bg-secondary hover:text-primary'
                                          }`}
                                        onClick={() => updateQuantity(
                                          item.isCombo ? item.comboCode : item.productCode, 
                                          item.quantity + 1, 
                                          item.selectedSize
                                        )}
                                      >
                                        <Plus key={`plus-${item.productCode}`} className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {(item.price * item.quantity).toFixed(2)} BDT
                                    </span>
                                  </div>
                                  <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`rounded-md 
                                        ${mounted && resolvedTheme === 'dark'
                                          ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                          : 'text-destructive hover:bg-destructive/10'
                                        }`}
                                      onClick={() => removeItem(
                                        item.isCombo ? item.comboCode : item.productCode, 
                                        item.selectedSize
                                      )}
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Remove
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
                
                {/* Continue Shopping */}
                <motion.div 
                  variants={itemVariants}
                  className="flex justify-between"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/store')}
                      className="group"
                    >
                      <ArrowLeft key="continue-shopping-arrow" className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                      Continue Shopping
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
              
              {/* Order Summary */}
              <motion.div 
                variants={itemVariants}
                className="lg:col-span-1"
              >
                <Card className={mounted && resolvedTheme === 'dark' ? 'border-gray-800' : ''}>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <motion.span 
                          key={`subtotal-${totalPrice}`}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 1 }}
                          className="font-medium"
                        >
                          {totalPrice.toFixed(2)} BDT
                        </motion.span>
                      </div>
                      
                      {/* Discount */}
                      <AnimatePresence>
                        {appliedCoupon && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-sm text-primary"
                          >
                            <span className="flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" />
                              {appliedCoupon.type === 'percentage' 
                                ? `Discount (${appliedCoupon.discount * 100}%)` 
                                : 'Discount'}
                            </span>
                            <span>-{discountAmount.toFixed(2)} BDT</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Shipping info */}
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        {shippingCost === 0 ? (
                          <span className="text-slate-400">Calculated at checkout</span>
                        ) : (
                          <span>{shippingCost.toFixed(2)} BDT</span>
                        )}
                      </div>
                      
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <motion.span 
                            key={`total-${grandTotal+shippingCost}`}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            className="text-lg text-primary"
                          >
                            {(grandTotal + shippingCost).toFixed(2)} BDT
                          </motion.span>
                        </div>
                        
                        <AnimatePresence>
                          {appliedCoupon && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="mt-1 text-center"
                            >
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                {appliedCoupon.code} applied
                              </span>
                              <button 
                                onClick={handleRemoveCoupon}
                                className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                              >
                                Remove
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    {/* Free shipping alert */}
                    <AnimatePresence>
                      {!qualifiesForFreeShipping && shippingCost > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert variant="info" className="bg-primary/5 text-xs">
                            <AlertTitle className="text-sm">Free Shipping Available</AlertTitle>
                            <AlertDescription>
                              Add <span className="font-medium text-primary">{(freeShippingThreshold - totalPrice).toFixed(2)} BDT</span> more to qualify for free shipping!
                            </AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Coupon code */}
                    {!appliedCoupon && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Have a promo code?</p>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Enter code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="h-9"
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="whitespace-nowrap px-3 h-9"
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim() || isApplyingCoupon}
                            >
                              {isApplyingCoupon ? (
                                <RefreshCw key="apply-coupon-spinner" className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <span key="apply-button-text">Apply</span>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                        {couponError && (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-destructive mt-1"
                          >
                            {couponError}
                          </motion.p>
                        )}
                        {/* <p className="text-xs text-muted-foreground mt-1">
                          Try "WELCOME10" for 10% off or "FREESHIP" for free shipping
                        </p> */}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button 
                        className={`w-full group shadow-md hover:shadow-lg transform hover:translate-y-[-1px] transition-all duration-200
                          ${mounted && resolvedTheme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : ''
                          }`}
                        onClick={handleCheckout}
                      >
                        <ShoppingBag key="checkout-bag-icon" className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        Proceed to Checkout
                        <ArrowRight key="checkout-arrow-icon" className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </motion.div>
                    
                    <div className="text-center text-xs text-muted-foreground pt-2">
                      Taxes and shipping calculated at checkout
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            // Empty cart state
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-16 max-w-md mx-auto"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="rounded-full bg-secondary/30 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center"
              >
                <ShoppingBag key="empty-cart-icon" className="h-10 w-10 text-primary/60" />
              </motion.div>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-semibold mb-3"
              >
                Your cart is empty
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-muted-foreground mb-8"
              >
                Looks like you haven't added any items to your cart yet.
                Start shopping to fill it with great items!
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => router.push('/store')}
                  className={`px-8 py-6 text-base group shadow-md
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : ''
                    }`}
                >
                  Start Shopping
                  <ArrowRight key="start-shopping-arrow" className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 