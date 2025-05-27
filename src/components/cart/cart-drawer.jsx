"use client"

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag, ArrowRight, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
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

  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
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

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        direction={{ base: "bottom", md: "right" }}
      >
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-secondary transition-colors duration-300 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
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
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                  <DrawerClose asChild>
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
                  </DrawerClose>
                </div>
              </div>
            </DrawerHeader>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className={`flex gap-4 pb-4 last:border-0 border-b
                        ${mounted && resolvedTheme === 'dark'
                          ? 'border-gray-700/50'
                          : 'border-slate-200'
                        }`}
                    >
                      <div className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 
                        ${mounted && resolvedTheme === 'dark'
                          ? 'bg-gray-700 border border-gray-600 shadow-md'
                          : 'bg-white border border-slate-200 shadow-sm'
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-7 w-7 rounded-full shadow-sm transition-all duration-200
                              ${mounted && resolvedTheme === 'dark'
                                ? 'border-gray-600 hover:scale-110 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                                : 'border-border hover:scale-110 hover:border-primary/30 hover:bg-secondary hover:text-primary'
                              }`}
                            onClick={() => updateQuantity(item.productCode, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-7 w-7 rounded-full shadow-sm transition-all duration-200
                              ${mounted && resolvedTheme === 'dark'
                                ? 'border-gray-600 hover:scale-110 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                                : 'border-border hover:scale-110 hover:border-primary/30 hover:bg-secondary hover:text-primary'
                              }`}
                            onClick={() => updateQuantity(item.productCode, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-full hover:scale-110 transition-all duration-200 ml-auto
                              ${mounted && resolvedTheme === 'dark'
                                ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                              }`}
                            onClick={() => removeItem(item.productCode)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 
                  ${mounted && resolvedTheme === 'dark'
                    ? 'bg-gray-800/30 rounded-lg border border-gray-700/30'
                    : 'bg-slate-50 rounded-lg'
                  }`}
                >
                  <div className="flex justify-center mb-4">
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
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h4>
                  <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
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
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div
                key={cartItems._id}
                className={`border-t border-border p-5 sticky bottom-0 mt-auto
                ${mounted && resolvedTheme === 'dark'
                    ? 'bg-gray-800/90 backdrop-blur-sm shadow-[0_-2px_15px_rgba(0,0,0,0.15)] border-gray-700/50'
                    : 'bg-card shadow-[0_-2px_15px_rgba(0,0,0,0.03)]'
                  }`}
              >
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">{totalPrice.toFixed(2)} BDT</span>
                  </div>

                  {appliedCoupon && appliedCoupon.type === 'percentage' && (
                    <div className="flex justify-between text-sm text-primary">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Discount ({appliedCoupon.discount * 100}%)
                      </span>
                      <span>-{discountAmount.toFixed(2)} BDT</span>
                    </div>
                  )}

                  {appliedCoupon && appliedCoupon.type === 'fixed' && (
                    <div className="flex justify-between text-sm text-primary">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Discount
                      </span>
                      <span>-{discountAmount.toFixed(2)} BDT</span>
                    </div>
                  )}

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
                    <span className="text-primary">{grandTotal.toFixed(2)} BDT</span>
                  </div>

                  {appliedCoupon && (
                    <div className="text-xs text-center">
                      <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {appliedCoupon.code} applied
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {!appliedCoupon && (
                    <div className="text-xs text-center mt-1">
                      {!showCouponInput ? (
                        <button
                          onClick={() => setShowCouponInput(true)}
                          className="text-xs text-primary hover:text-primary/80 underline"
                        >
                          Have a coupon code?
                        </button>
                      ) : (
                        <div className="flex flex-col space-y-2 mt-2 px-1">
                          <div className="flex gap-1">
                            <Input
                              placeholder="Enter code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="h-7 text-xs"
                            />
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
                          </div>
                          {couponError && (
                            <p className="text-xs text-destructive">{couponError}</p>
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 transition-all duration-200
                      ${mounted && resolvedTheme === 'dark'
                        ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700/50'
                        : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                      }`}
                    onClick={() => setOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`flex-1 transition-all duration-200 font-medium shadow-sm
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
                </div>
              </div>
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