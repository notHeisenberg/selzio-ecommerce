"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, ChevronDown, ChevronUp, UserPlus, ShoppingBag, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SocialLogin from '@/components/auth/social-login';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CheckoutAuthDialog = ({
  open,
  onOpenChange,
  onSuccess,
  redirectUrl = '/checkout',
}) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCartVisible, setIsCartVisible] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [processingRedirect, setProcessingRedirect] = useState(false);

  const router = useRouter();
  const { cartItems, totalItems, totalPrice } = useCart();
  const { isAuthenticated, user, login, register, api } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const registerForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Load coupon from sessionStorage
  useEffect(() => {
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
  }, [open]);
  
  // Handle redirect after authentication state changes
  useEffect(() => {
    if (processingRedirect && isAuthenticated && user) {
      // Ensure coupon data is in sessionStorage
      if (appliedCoupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      }
      
      // Clear auth_checked flag to ensure auth is properly rechecked after redirect
      sessionStorage.removeItem('auth_checked');
      
      // Set a timeout to ensure auth state is fully processed
      const redirectTimer = setTimeout(() => {
        
        setProcessingRedirect(false);
        
        if (onSuccess) {
          onSuccess();
        } else {
          if (onOpenChange) onOpenChange(false);
          router.push(redirectUrl);
        }
      }, 1500); // Longer delay to ensure auth state is fully updated
      
      return () => clearTimeout(redirectTimer);
    }
  }, [processingRedirect, isAuthenticated, user, onSuccess, onOpenChange, router, redirectUrl, appliedCoupon]);

  // Detect when the auth state changes after initial render
  useEffect(() => {
    // If the session becomes authenticated and we're showing the dialog
    if (isAuthenticated && user && open) {
      // Prepare for redirect
      prepareForRedirect();
    }
  }, [isAuthenticated, user, open]);

  // Calculate discount amount (if applicable)
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === 'percentage') {
      return totalPrice * appliedCoupon.discount;
    } else if (appliedCoupon.type === 'fixed') {
      // For fixed discounts other than shipping
      return appliedCoupon.discount;
    }
    
    return 0;
  };
  
  const discountAmount = appliedCoupon ? getDiscountAmount() : 0;
  
  // Calculate grand total
  const grandTotal = totalPrice - discountAmount;

  // Toggle auth mode function
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setAuthError('');
  };

  // Toggle cart visibility in the auth dialog
  const toggleCart = () => {
    setIsCartVisible(!isCartVisible);
  };
  
  // Helper function to save coupon and prepare for redirect
  const prepareForRedirect = () => {
    // Save coupon to sessionStorage
    if (appliedCoupon) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    }
    
    // Also store the checkout redirect URL for social auth flows
    sessionStorage.setItem('auth_redirect', redirectUrl);
    
    // Force refresh the authentication token for API requests
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // Set flag to monitor auth state for redirect
    setProcessingRedirect(true);
    
  };
  
  // Handle login
  const handleLogin = async (data) => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      // Call the login function from auth hook
      await login(data.email, data.password);
      
      // Clear auth_checked flag to ensure auth is properly rechecked after redirect
      sessionStorage.removeItem('auth_checked');
      
      // Prepare for redirect after auth state updates
      prepareForRedirect();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Login failed. Please try again.');
      setProcessingRedirect(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register
  const handleRegister = async (data) => {
    setIsLoading(true);
    setAuthError('');
    
    try {
      // Call the register function from auth hook
      await register(data);
      
      // After registration, log them in
      await login(data.email, data.password);
      
      // Clear auth_checked flag to ensure auth is properly rechecked after redirect
      sessionStorage.removeItem('auth_checked');
      
      // Prepare for redirect after auth state updates
      prepareForRedirect();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Registration failed. Please try again.');
      setProcessingRedirect(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden max-h-[90vh] md:max-h-[80vh]">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          {/* Cart Summary Side */}
          <div className={`w-full md:w-5/12 bg-muted flex flex-col transition-all duration-300 
            ${isCartVisible ? 'max-h-[30vh]' : 'max-h-[60px]'} md:max-h-none md:h-full`}>
            <div 
              className="p-4 md:p-6 border-b flex justify-between items-center sticky top-0 bg-muted z-10 cursor-pointer"
              onClick={() => toggleCart()}
            >
              <DialogHeader className="text-left space-y-1 flex-1">
                <DialogTitle className="text-lg md:text-xl font-bold">Your Cart</DialogTitle>
                <DialogDescription className={`text-xs md:text-sm ${!isCartVisible ? 'hidden' : ''}`}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} • {grandTotal.toFixed(2)} BDT (excluding shipping)
                </DialogDescription>
              </DialogHeader>
              
              {/* Mobile cart toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden h-8 w-8 p-0 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCart();
                }}
              >
                {isCartVisible ? <ChevronUp key="chevron-up" className="h-4 w-4" /> : <ChevronDown key="chevron-down" className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Scrollable cart content */}
            <div 
              id="cart-items" 
              className={`overflow-y-auto flex-1 transition-all duration-300 ${isCartVisible ? 'max-h-[30vh]' : 'max-h-0'} md:max-h-none`}
            >
              <div className="p-4 md:p-6 space-y-4">
                {cartItems.map((item) => (
                  <div key={`${item.productCode}-${item.selectedSize || 'default'}`} className="flex items-start gap-3">
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-md overflow-hidden border bg-background">
                      {typeof item.image === 'string' && item.image !== '' ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // If image fails to load, show fallback UI
                            e.target.style.display = 'none';
                            e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
                            const fallback = document.createElement('div');
                            fallback.className = 'text-lg font-semibold text-muted-foreground';
                            fallback.innerText = item.name?.substring(0, 1) || 'P';
                            e.target.parentNode.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted-foreground">
                            {item.name?.substring(0, 1) || 'P'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary">{(item.price * item.quantity).toFixed(2)} BDT</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 md:p-6 pt-2 border-t space-y-2 bg-muted/80 sticky bottom-0">
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm">Subtotal</span>
                  <span className="text-xs md:text-sm font-medium">{totalPrice.toFixed(2)} BDT</span>
                </div>
                
                {appliedCoupon && appliedCoupon.type === 'percentage' && (
                  <div className="flex justify-between text-xs md:text-sm text-primary">
                    <span className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Discount ({appliedCoupon.discount * 100}%)
                    </span>
                    <span>-{discountAmount.toFixed(2)} BDT</span>
                  </div>
                )}
                
                {appliedCoupon && appliedCoupon.type === 'fixed' && (
                  <div className="flex justify-between text-xs md:text-sm text-primary">
                    <span className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Discount
                    </span>
                    <span>-{discountAmount.toFixed(2)} BDT</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-xs md:text-sm">Shipping</span>
                  <span className="text-xs md:text-sm text-primary">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span className="text-sm md:text-base">Total</span>
                  <span className="text-sm md:text-base text-primary">{grandTotal.toFixed(2)} BDT</span>
                </div>
                
                <div className="text-xs text-center text-muted-foreground">
                  Shipping costs will be calculated at checkout
                </div>
                
                {appliedCoupon && (
                  <div className="mt-1 text-center">
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {appliedCoupon.code} applied
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Authentication Side - Always visible regardless of cart state */}
          <div 
            className="w-full md:w-7/12 flex flex-col overflow-auto"
          >
            <div className="p-4 md:p-6 flex-1 overflow-y-auto">
              <DialogHeader className="mb-4 md:mb-5 text-center md:text-left">
                <DialogTitle className="text-lg md:text-xl font-bold">
                  {authMode === 'login' ? 'Sign in to continue' : 'Create an account'}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {authMode === 'login' 
                    ? 'Please sign in to your account to proceed with checkout' 
                    : 'Create an account to complete your purchase and track your orders'}
                </DialogDescription>
                
                {authError && (
                  <div className="mt-3 p-2 md:p-3 text-xs md:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {authError}
                  </div>
                )}
              </DialogHeader>
              
              {/* Social Login Buttons */}
              <SocialLogin 
                onSuccess={() => {
                  // Ensure coupon data is saved to sessionStorage
                  if (appliedCoupon) {
                    sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
                  }
                  
                  // Set processing state to show loading UI
                  setProcessingRedirect(true);
                  
                  // No setTimeout needed - just let the useEffect handle redirection
                  // when auth state changes
                }}
                redirectUrl={redirectUrl}
                className="mb-4"
                compact={true}
              />
              
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              {authMode === 'login' ? (
                // Login Form
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      {...loginForm.register('email', { required: true })}
                      disabled={isLoading || processingRedirect}
                      className="h-9 md:h-10 transition-all focus:scale-[1.01] focus:shadow-sm"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      {...loginForm.register('password', { required: true })}
                      disabled={isLoading || processingRedirect}
                      className="h-9 md:h-10 transition-all focus:scale-[1.01] focus:shadow-sm"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-9 md:h-10 mt-2 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md active:translate-y-0" 
                    disabled={isLoading || processingRedirect}
                  >
                    {isLoading || processingRedirect ? (
                      <span className="flex items-center justify-center">
                        <svg key="login-spinner" className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {processingRedirect ? 'Redirecting to checkout...' : 'Signing in...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <LogIn key="login-icon" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        Sign In & Checkout
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                // Register Form
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      {...registerForm.register('name', { required: true })}
                      disabled={isLoading || processingRedirect}
                      className="h-9 md:h-10 transition-all focus:scale-[1.01] focus:shadow-sm"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      {...registerForm.register('email', { required: true })}
                      disabled={isLoading || processingRedirect}
                      className="h-9 md:h-10 transition-all focus:scale-[1.01] focus:shadow-sm"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      {...registerForm.register('password', { required: true })}
                      disabled={isLoading || processingRedirect}
                      className="h-9 md:h-10 transition-all focus:scale-[1.01] focus:shadow-sm"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-9 md:h-10 mt-2 transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-md active:translate-y-0" 
                    disabled={isLoading || processingRedirect}
                  >
                    {isLoading || processingRedirect ? (
                      <span className="flex items-center justify-center">
                        <svg key="register-spinner" className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {processingRedirect ? 'Redirecting to checkout...' : 'Creating account...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center group">
                        <UserPlus key="user-plus-icon" className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                        Create Account & Checkout
                      </span>
                    )}
                  </Button>
                </form>
              )}
              
              <div className="mt-4 md:mt-6 text-center">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <Button 
                    variant="link" 
                    className="ml-1 h-auto p-0 text-xs md:text-sm transition-colors hover:text-primary/70 relative hover:after:w-full after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-primary/30 after:transition-all after:duration-300" 
                    onClick={toggleAuthMode}
                    disabled={isLoading || processingRedirect}
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </Button>
                </p>
              </div>
            </div>
            
            <DialogFooter className="p-4 border-t mt-auto flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading || processingRedirect}
                size="sm"
                className="text-xs md:text-sm h-9 transition-all duration-300 hover:bg-background/80 hover:scale-105 active:scale-100"
              >
                Continue Shopping
              </Button>
              
              {/* Toggle cart button on mobile */}
              <Button
                variant="secondary"
                size="sm"
                className="md:hidden h-9 text-xs transition-all duration-300 hover:bg-secondary/80 hover:scale-105 active:scale-100 group"
                onClick={toggleCart}
                disabled={isLoading || processingRedirect}
              >
                <ShoppingBag className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                {isCartVisible ? 'Hide Cart' : 'Show Cart'}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutAuthDialog; 