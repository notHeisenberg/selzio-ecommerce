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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
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

  // Calculate the total price for an item including discount
  const calculateItemTotal = (item) => {
    if (!item) return 0;
    
    // Apply any item-specific discount
    let itemPrice = item.price;
    if (item.discount && item.discount > 0) {
      itemPrice = getDiscountedPrice(itemPrice, item.discount);
    }
    
    // Multiply by quantity
    return itemPrice * item.quantity;
  };

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
    router.push('/checkout');
    setOpen(false);
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
            <ScrollArea className="h-full">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] px-4">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Your cart is empty</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <Button onClick={() => setOpen(false)} asChild>
                    <Link href="/store">
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="px-4 pb-6 space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex py-4 border-b border-border">
                      {/* Product image */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border">
                        <Image
                          src={item.image || '/images/product-placeholder.jpg'}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Product details */}
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium">
                            <Link
                              href={item.isCombo ? `/combos/${item.comboCode}` : `/products/all/${item.productCode}`}
                              className="hover:underline"
                              onClick={() => setOpen(false)}
                            >
                              {item.name}
                            </Link>
                            <span className="ml-4">
                              {formatPrice(calculateItemTotal(item))}
                              {item.discount && item.discount > 0 && (
                                <span className="block text-xs text-muted-foreground line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              )}
                            </span>
                          </div>
                          {item.selectedSize && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Size: {item.selectedSize}
                            </p>
                          )}
                          
                          {/* Show combo items */}
                          {item.isCombo && item.products && item.products.length > 0 && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              <p className="text-xs font-medium">Combo includes:</p>
                              <ul className="list-disc pl-4 mt-0.5">
                                {item.products.map((product, idx) => (
                                  <li key={idx} className="text-xs">
                                    {product.name} {product.size && `(${product.size})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm">
                          {/* Quantity selector */}
                          <div className="flex items-center gap-2">
                            <label htmlFor={`quantity-${index}`} className="sr-only">
                              Quantity, {item.name}
                            </label>
                            <button
                              type="button"
                              className="size-6 rounded-md border border-border flex items-center justify-center"
                              onClick={() => updateQuantity(item.isCombo ? item.comboCode : item.productCode, Math.max(1, item.quantity - 1), item.selectedSize)}
                              disabled={item.quantity <= 1}
                            >
                              <MinusIcon className="size-3" />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              className="size-6 rounded-md border border-border flex items-center justify-center"
                              onClick={() => updateQuantity(item.isCombo ? item.comboCode : item.productCode, item.quantity + 1, item.selectedSize)}
                            >
                              <PlusIcon className="size-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-500 font-medium"
                            onClick={() => removeItem(item.isCombo ? item.comboCode : item.productCode, item.selectedSize)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

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
                            {/* <p className="text-xs text-muted-foreground">
                              Try WELCOME10 for 10% off
                            </p> */}
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
    </>
  );
};

export default CartDrawer; 