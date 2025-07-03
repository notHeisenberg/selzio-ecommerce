"use client"

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag, ArrowRight, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutAuthDialog from '@/components/auth/checkout-auth-dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from '@/components/ui/input';

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, totalItems, totalPrice, isInitialized } = useCart();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Avoid hydration mismatch and ensure data is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Listen for custom event to open the cart drawer
  useEffect(() => {
    const handleOpenCart = () => setOpen(true);
    document.addEventListener('open-cart-drawer', handleOpenCart);

    return () => {
      document.removeEventListener('open-cart-drawer', handleOpenCart);
    };
  }, []);

  // Load coupon from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      const couponData = window.sessionStorage.getItem('appliedCoupon');
      if (couponData) {
        try {
          setAppliedCoupon(JSON.parse(couponData));
        } catch (error) {
          console.error('Error parsing coupon data:', error);
          sessionStorage.removeItem('appliedCoupon');
          setAppliedCoupon(null);
        }
      } else {
        setAppliedCoupon(null);
      }
    }
  }, [open, mounted]);

  // Coupon codes - In a real app, these would come from the database
  const VALID_COUPONS = {
    'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
    'FREESHIP': { discount: 5.99, type: 'fixed', description: 'Free standard shipping' },
  };

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
        setShowCouponInput(false);

        // Save to session storage
        sessionStorage.setItem('appliedCoupon', JSON.stringify({
          code: normalizedCode,
          ...VALID_COUPONS[normalizedCode]
        }));
      } else {
        setCouponError('Invalid code');
        setAppliedCoupon(null);
      }

      setIsApplyingCoupon(false);
    }, 600);
  };

  // Handle removing coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    sessionStorage.removeItem('appliedCoupon');
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.type === 'percentage') {
      return totalPrice * appliedCoupon.discount;
    } else if (appliedCoupon.type === 'fixed') {
      return appliedCoupon.discount;
    }

    return 0;
  };

  const discountAmount = appliedCoupon ? getDiscountAmount() : 0;

  // Calculate grand total
  const grandTotal = totalPrice - discountAmount;

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push('/checkout');
      setOpen(false);
    } else {
      setShowAuthDialog(true);
    }
  };

  // Animation variants
  const cartItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { 
      opacity: 0, 
      x: -20, 
      transition: { duration: 0.2 } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  // Update the isLoading check to also depend on cart initialization
  const showLoading = isLoading || !isInitialized;

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        direction={{ base: "bottom", md: "right" }}
      >
        <DrawerTrigger asChild>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-secondary transition-colors duration-300 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    key="cart-count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </DrawerTrigger>

        <DrawerContent
          direction={{ base: "bottom", md: "right" }}
          className={`flex flex-col h-[85vh] md:h-full md:w-96 md:max-w-[420px] bg-background border-l border-border
            ${mounted && resolvedTheme === 'dark'
              ? 'shadow-[0_0_25px_rgba(0,0,0,0.5)]'
              : 'shadow-[0_0_25px_rgba(100,116,139,0.1)]'
            }`}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <DrawerHeader className={`px-5 py-4 sticky top-0 z-10 border-b border-border
              ${mounted && resolvedTheme === 'dark'
                ? 'bg-gray-800/90 backdrop-blur-sm shadow-sm border-gray-700/50'
                : 'bg-card/90 backdrop-blur-sm shadow-sm'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <DrawerTitle className="text-lg font-semibold text-foreground">Your Shopping Cart</DrawerTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium
                    ${mounted && resolvedTheme === 'dark'
                      ? 'text-gray-400'
                      : 'text-slate-500'
                    }`}>
                    {showLoading ? (
                      <span className="inline-block h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                    ) : (
                      `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`
                    )}
                  </span>
                  <DrawerClose asChild>
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full transition-all duration-200 transform hover:scale-105
                          ${mounted && resolvedTheme === 'dark'
                            ? 'hover:bg-gray-700 hover:text-blue-300'
                            : 'hover:bg-violet-100 hover:text-violet-700'
                          }`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {showLoading ? (
                // Loading skeleton
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div 
                      key={`loading-${i}`}
                      className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700/50"
                    >
                      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : cartItems.length > 0 ? (
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={`${item.productCode}-${item.selectedSize || 'default'}`}
                        variants={cartItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`flex gap-4 pb-4 last:border-0 border-b
                          ${mounted && resolvedTheme === 'dark'
                            ? 'border-gray-700/50'
                            : 'border-slate-200'
                          }`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 
                            ${mounted && resolvedTheme === 'dark'
                              ? 'bg-gray-700 border border-gray-600 shadow-md'
                              : 'bg-white border border-slate-200 shadow-sm'
                            }`}
                        >
                          {typeof item.image === 'string' && item.image !== '' ? (
                            <Image
                              src={item.image}
                              alt={item.name || 'Product'}
                              fill
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
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate mb-1
                            ${mounted && resolvedTheme === 'dark'
                              ? 'text-gray-200'
                              : 'text-slate-800'
                            }`}
                          >
                            {item.name}
                          </h4>
                          <p className={`text-base font-semibold mb-2
                            ${mounted && resolvedTheme === 'dark'
                              ? 'text-blue-400'
                              : 'text-violet-700'
                            }`}
                          >
                            {item.price.toFixed(2)} BDT
                          </p>
                          
                          {/* Display size if available */}
                          {item.selectedSize && (
                            <p className="text-xs text-muted-foreground mb-2">
                              Size: <span className="font-medium">({item.selectedSize})</span>
                              {item.sizeStock !== undefined && (
                                <span className="ml-1 text-xs">
                                  {item.sizeStock > 0 
                                    ? `(${item.sizeStock} in stock)` 
                                    : '(Low stock)'}
                                </span>
                              )}
                            </p>
                          )}
                          
                          {/* Display short description or regular description if available */}
                          {(item.shortDescription || item.description) && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {item.shortDescription 
                                ? (typeof item.shortDescription === 'string' && item.shortDescription.startsWith('<') 
                                  ? item.shortDescription.replace(/<[^>]*>/g, '') 
                                  : item.shortDescription)
                                : (typeof item.description === 'string' && item.description.startsWith('<') 
                                  ? item.description.replace(/<[^>]*>/g, '') 
                                  : item.description)}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <motion.div 
                              whileHover={{ scale: 1.1 }} 
                              whileTap={{ scale: 0.9 }}
                              className="shadow-sm"
                            >
                              <Button
                                variant="outline"
                                size="icon"
                                className={`h-7 w-7 rounded-md shadow-sm transition-all duration-200
                                  ${mounted && resolvedTheme === 'dark'
                                    ? 'border-gray-600 hover:bg-gray-700 hover:text-blue-400'
                                    : 'border-border hover:bg-secondary hover:text-primary'
                                  }`}
                                onClick={() => updateQuantity(item.productCode, item.quantity - 1, item.selectedSize)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            <motion.span 
                              key={`qty-${item.productCode}-${item.selectedSize}-${item.quantity}`}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="text-sm font-medium w-6 text-center text-foreground"
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
                                className={`h-7 w-7 rounded-md shadow-sm transition-all duration-200
                                  ${mounted && resolvedTheme === 'dark'
                                    ? 'border-gray-600 hover:bg-gray-700 hover:text-blue-400'
                                    : 'border-border hover:bg-secondary hover:text-primary'
                                  }`}
                                onClick={() => updateQuantity(item.productCode, item.quantity + 1, item.selectedSize)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="ml-auto"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-7 w-7 rounded-md hover:scale-110 transition-all duration-200
                                  ${mounted && resolvedTheme === 'dark'
                                    ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                    : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                                  }`}
                                onClick={() => removeItem(item.productCode, item.selectedSize)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-center py-12 
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-gray-800/30 rounded-lg border border-gray-700/30'
                      : 'bg-slate-50 rounded-lg'
                    }`}
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="flex justify-center mb-4"
                  >
                    <div className={`rounded-full p-3 
                      ${mounted && resolvedTheme === 'dark'
                        ? 'bg-gray-700'
                        : 'bg-slate-100'
                      }`}
                    >
                      <ShoppingCart key="empty-cart-icon" className={`h-6 w-6 
                        ${mounted && resolvedTheme === 'dark'
                          ? 'text-gray-400'
                          : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </motion.div>
                  <motion.h4 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg font-semibold text-foreground mb-2"
                  >
                    Your cart is empty
                  </motion.h4>
                  <motion.p 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground mb-6"
                  >
                    Looks like you haven't added any items to your cart yet.
                  </motion.p>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => {
                        router.push('/store');
                        setOpen(false);
                      }}
                      className={`px-5 group
                        ${mounted && resolvedTheme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                    >
                      Start Shopping
                      <ArrowRight key="start-shopping-arrow" className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {cartItems.length > 0 && !showLoading && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, type: "spring" }}
                key="cart-summary"
                className={`border-t border-border p-5 sticky bottom-0 mt-auto
                ${mounted && resolvedTheme === 'dark'
                    ? 'bg-gray-800/90 backdrop-blur-sm shadow-[0_-2px_15px_rgba(0,0,0,0.15)] border-gray-700/50'
                    : 'bg-card shadow-[0_-2px_15px_rgba(0,0,0,0.03)]'
                  }`}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Subtotal</span>
                    <motion.span
                      key={`subtotal-${totalPrice}`}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      className="font-medium text-foreground"
                    >
                      {totalPrice.toFixed(2)} BDT
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {appliedCoupon && appliedCoupon.type === 'percentage' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-sm text-primary"
                      >
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Discount ({appliedCoupon.discount * 100}%)
                        </span>
                        <span>-{discountAmount.toFixed(2)} BDT</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {appliedCoupon && appliedCoupon.type === 'fixed' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between text-sm text-primary"
                      >
                        <span className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          Discount
                        </span>
                        <span>-{discountAmount.toFixed(2)} BDT</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className={`border-t pt-2 mt-2 
                    ${mounted && resolvedTheme === 'dark'
                      ? 'border-gray-700/50'
                      : 'border-border'
                    }`}
                  ></div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <motion.span 
                      key={`total-${grandTotal}`}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="text-primary"
                    >
                      {grandTotal.toFixed(2)} BDT
                    </motion.span>
                  </div>

                  <AnimatePresence>
                    {appliedCoupon && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-center"
                      >
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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

                  <AnimatePresence>
                    {!appliedCoupon && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-center mt-1"
                      >
                        {!showCouponInput ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCouponInput(true)}
                            className="text-xs text-primary hover:text-primary/80 underline"
                          >
                            Have a coupon code?
                          </motion.button>
                        ) : (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex flex-col space-y-2 mt-2 px-1"
                          >
                            <div className="flex gap-1">
                              <Input
                                placeholder="Enter code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="h-7 text-xs"
                              />
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-xs whitespace-nowrap px-2"
                                  onClick={handleApplyCoupon}
                                  disabled={!couponCode.trim() || isApplyingCoupon}
                                >
                                  {isApplyingCoupon ? (
                                    <RefreshCw key="apply-coupon-spinner" className="h-3 w-3 animate-spin" />
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
                                className="text-xs text-destructive"
                              >
                                {couponError}
                              </motion.p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Try WELCOME10 for 10% off
                            </p>
                            <button
                              onClick={() => setShowCouponInput(false)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className={`w-full group shadow-md hover:shadow-lg transform hover:translate-y-[-1px] transition-all duration-200
                      ${mounted && resolvedTheme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                      }`}
                    onClick={handleCheckout}
                  >
                    <ShoppingBag key="checkout-bag-icon" className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    Proceed to Checkout
                    <ArrowRight key="checkout-arrow-icon" className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </motion.div>
                <div className="flex gap-2 mt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full transition-all duration-200
                        ${mounted && resolvedTheme === 'dark'
                          ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700/50'
                          : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                        }`}
                      onClick={() => setOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`w-full transition-all duration-200 font-medium shadow-sm
                          ${mounted && resolvedTheme === 'dark'
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-900/40 hover:bg-blue-500/40 hover:text-blue-100 hover:border-blue-700/50'
                          : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:text-primary-foreground hover:border-primary/40'
                        }`}
                      onClick={() => {
                        router.push('/cart');
                        setOpen(false);
                      }}
                    >
                      <ShoppingCart key="view-cart-icon" className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      View Cart
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Use the shared auth dialog component */}
      <CheckoutAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          router.push('/checkout');
          setOpen(false);
        }}
      />
    </>
  );
};

export default CartDrawer; 