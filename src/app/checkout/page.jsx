"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Truck, Shield, ArrowLeft, Check, ChevronDown, ChevronUp, Tag, Wallet, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Replace with new shipping methods for Bangladesh
const shippingMethods = [
  {
    id: 'dhaka',
    name: 'Inside Dhaka',
    price: 50,
    deliveryTime: '1-2 business days',
    areas: ['Dhaka City']
  },
  {
    id: 'suburban',
    name: 'Dhaka Sub-Urban',
    price: 80,
    deliveryTime: '1-2 business days',
    areas: ['Savar', 'Keraniganj', 'Dohar', 'Tongi', 'Gazipur', 'Narayanganj']
  },
  {
    id: 'outside_dhaka',
    name: 'Outside Dhaka',
    price: 120,
    deliveryTime: '2-3 business days',
    areas: ['All other districts']
  }
];

// Fake payment methods data
const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: <Image src="/payment/cash-on-delivery.svg" width={24} height={24} alt="Cash on Delivery" /> },
  { id: 'bkash', name: 'bKash', icon: <Image src="/payment/bkash.svg" width={24} height={24} alt="bKash" /> },
  { id: 'nagad', name: 'Nagad', icon: <Image src="/payment/nagad.svg" width={24} height={24} alt="Nagad" /> }
];

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading, api } = useAuth();
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState('shipping');
  const [shippingMethod, setShippingMethod] = useState('dhaka');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [mfsDetails, setMfsDetails] = useState({
    transactionId: '',
    screenshot: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showReturnPolicyDialog, setShowReturnPolicyDialog] = useState(false);

  // React Hook Form for shipping information
  const { register, handleSubmit, setValue, formState: { errors }, getValues } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      saveInfo: true,
    }
  });

  // Load coupon from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const couponData = window.sessionStorage.getItem('appliedCoupon');
      if (couponData) {
        try {
          const parsedCoupon = JSON.parse(couponData);
          setAppliedCoupon(parsedCoupon);
        } catch (error) {
          console.error('Error parsing coupon data:', error);
          sessionStorage.removeItem('appliedCoupon');
          // Show toast or notification to user that coupon couldn't be applied
          // This could be implemented with a toast library if available
        }
      }
    }
  }, []);

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

  // Load user data if authenticated and try to load saved shipping info
  useEffect(() => {
    if (isAuthenticated && user) {
      // First try to load saved shipping information from localStorage
      const savedShippingInfo = localStorage.getItem(`shipping_info_${user.email}`);

      if (savedShippingInfo) {
        try {
          const parsedInfo = JSON.parse(savedShippingInfo);

          // Set form values from saved data
          Object.entries(parsedInfo).forEach(([field, value]) => {
            setValue(field, value);
          });

        } catch (error) {
          console.error('Error parsing saved shipping data:', error);
          // Fall back to basic user info if saved data is corrupted
          setValue('name', user.name || '');
          setValue('email', user.email || '');
          setValue('phone', user.phone || '');
          setValue('address', user.address || '');
        }
      } else {
        // If no saved info, fall back to basic user info
        setValue('name', user.name || '');
        setValue('email', user.email || '');
        setValue('phone', user.phone || '');
        setValue('address', user.address || '');
      }
    }
  }, [isAuthenticated, user, setValue]);

  // Redirect if not authenticated
  useEffect(() => {
    // Add a delay to ensure auth state is fully established
    const authCheckTimer = setTimeout(() => {
      if (!authLoading && !isAuthenticated) {
        router.push('/auth/login?redirect=/checkout');
      }
    }, 1500); // Longer delay to ensure auth state is fully loaded

    return () => clearTimeout(authCheckTimer);
  }, [authLoading, isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    // Add a delay to ensure cart is fully loaded
    const cartCheckTimer = setTimeout(() => {
      if (!authLoading && cartItems.length === 0) {
        router.push('/cart');
      }
    }, 1500); // Longer delay to ensure cart is fully loaded

    return () => clearTimeout(cartCheckTimer);
  }, [authLoading, cartItems, router]);

  // Calculate final price
  const selectedShipping = shippingMethods.find(method => method.id === shippingMethod);
  const shippingPrice = selectedShipping?.price || 0;
  const subtotal = totalPrice;
  const total = subtotal + shippingPrice - discountAmount;

  // Free shipping qualification
  const qualifiesForFreeShipping = subtotal >= 50;

  // Handle form submissions
  const onSubmitShipping = (data) => {
    // Save shipping info to localStorage if the checkbox is checked
    if (data.saveInfo && isAuthenticated && user) {
      try {
        // Store shipping details for future use
        const shippingDataToSave = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          saveInfo: true
        };

        localStorage.setItem(`shipping_info_${user.email}`, JSON.stringify(shippingDataToSave));
      } catch (error) {
        console.error('Error saving shipping information:', error);
        // Continue with the order even if saving fails
      }
    }

    setActiveStep('payment');
  };

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create form data for uploading
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Cloudinary using environment variables
      const response = await api.post('/api/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to upload image');
      }

      // Return the secure URL
      return response.data.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      if (error.response?.data?.details) {
        throw new Error(error.response.data.details);
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to upload image');
    }
  };

  // Function to create order in database
  const createOrder = async (orderData) => {
    try {
      // Ensure we have the latest auth token from localStorage before making the API call
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      // Check if this is an auth error (401)
      if (error.response && error.response.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please login again.',
          variant: 'destructive'
        });
        // Clear auth_checked to ensure re-authentication on next page load
        sessionStorage.removeItem('auth_checked');
        // Redirect to login
        setTimeout(() => {
          router.push('/auth/login?redirect=/checkout');
        }, 1500);
      }
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const onSubmitPayment = async () => {
    // Validate terms and return policy
    if (!policyAccepted) {
      toast({
        title: "Agreements Required",
        description: "Please agree to the Terms and Conditions and Return Policy.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate based on payment method
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!mfsDetails.transactionId) {
        toast({
          title: "Transaction ID Required",
          description: "Please provide the Transaction ID for your payment.",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'cod') {
      // No additional validation for COD
    }
    
    setIsSubmitting(true);
    
    try {
      // Refresh authentication state before submitting
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (typeof api?.defaults?.headers?.common !== 'undefined') {
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Get shipping info from React Hook Form
      const shippingInfo = getValues();
      
      // Handle payment screenshot upload if exists
      let paymentImageUrl = '';
      if (mfsDetails.screenshot && (paymentMethod === 'bkash' || paymentMethod === 'nagad')) {
        paymentImageUrl = await uploadImageToCloudinary(mfsDetails.screenshot);
        setUploadedImageUrl(paymentImageUrl);
      }
      
      // Prepare payment details based on method
      const paymentDetails = 
        (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? {
          method: paymentMethod,
          transactionId: mfsDetails.transactionId,
          paymentScreenshot: paymentImageUrl,
          paymentNumber: paymentMethod === 'bkash' ? '01724318584' : '01778053337',
          paymentStatus: 'pending' // Requires admin verification
        } : 
        paymentMethod === 'cod' ? { 
          method: 'cod',
          paymentStatus: 'pending' 
        } : null;
      
      // Determine order status based on payment method
      const orderStatus = 
        (paymentMethod === 'bkash' || paymentMethod === 'nagad') ? 'awaiting_payment_verification' : 
        paymentMethod === 'cod' ? 'pending' : 'paid';
      
      // Create order data object
      const orderData = {
        items: cartItems,
        shipping: {
          info: shippingInfo,
          method: shippingMethod,
          price: shippingPrice,
          ...shippingMethods.find(method => method.id === shippingMethod)
        },
        payment: paymentDetails,
        orderType: paymentMethod,
        subtotal,
        discount: discountAmount,
        coupon: appliedCoupon,
        total,
        status: orderStatus
      };
      
      // Create order in database
      const createdOrder = await createOrder(orderData);
      
      // Show success toast for order processing
      toast({
        title: 'Order Submitted',
        description: paymentMethod === 'bkash' || paymentMethod === 'nagad' 
          ? 'Your order has been placed and is awaiting payment verification.' 
          : 'Your order has been placed successfully.',
        variant: 'success',
        action: (
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            className="w-full mt-2"
          >
            <button 
              className="w-full flex items-center justify-center px-3 py-2 rounded-none border-2 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              onClick={() => window.location.href = '/checkout/success'}
            >
              <Check className="mr-2 h-4 w-4" />
              View Order
            </button>
          </motion.div>
        )
      });
      
      // Store payment method for success page to display appropriate message
      sessionStorage.setItem('payment_method', paymentMethod);
      
      // Also store the order ID for the success page
      if (createdOrder && createdOrder._id) {
        sessionStorage.setItem('last_order_id', createdOrder._id);
      }
      
      // Remove coupon from session storage
      sessionStorage.removeItem('appliedCoupon');
      
      // Force navigation to success page with a delay to ensure all processes complete
      setTimeout(() => {
        // Clear cart right before navigation to prevent any race conditions
        clearCart();
        
        // Use window.location.href for a hard navigation to avoid any router interference
        window.location.href = '/checkout/success';
      }, 2000);
    } catch (error) {
      console.error('Order submission error:', error);
      
      // Handle authentication errors specifically
      if (error.message?.includes('Authentication required') || 
          (error.response?.status === 401) ||
          error.message?.includes('Unauthorized')) {
        
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again to complete your order.',
          variant: 'destructive',
          action: (
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              className="w-full mt-2"
            >
              <button 
                className="w-full flex items-center justify-center px-3 py-2 rounded-none border-2 border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                onClick={() => router.push('/auth/login?redirect=/checkout')}
              >
                Login Again
              </button>
            </motion.div>
          )
        });
        
        // Clear auth state to force re-login
        sessionStorage.removeItem('auth_checked');
        
        // Redirect to login with return URL
        setTimeout(() => {
          router.push('/auth/login?redirect=/checkout');
        }, 1500);
        
        return;
      }
      
      toast({
        title: 'Order Submission Failed',
        description: error.message || 'There was an error processing your order. Please try again.',
        variant: 'destructive',
        action: (
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            className="w-full mt-2"
          >
            <button 
              className="w-full flex items-center justify-center px-3 py-2 rounded-none border-2 border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              onClick={() => setIsSubmitting(false)}
            >
              Try Again
            </button>
          </motion.div>
        )
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a state to track if we're just initializing the page
  const [initializing, setInitializing] = useState(true);

  // Add an effect to set initializing to false after a delay
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setInitializing(false);
    }, 1000);

    return () => clearTimeout(initTimer);
  }, []);



  // Modify the loading check to include initializing state
  if (authLoading || initializing || (cartItems.length === 0 && initializing)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Setting up checkout...</p>
          {authLoading && <p className="text-sm text-muted-foreground mt-2">Verifying your account...</p>}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Checkout Header */}
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your order by providing your shipping and payment details
            </p>
          </div>

          {/* Mobile Order Summary Toggle */}
          <div className="md:hidden mb-6">
            <Button
              variant={showOrderSummary ? "default" : "outline"}
              className={`w-full flex items-center justify-between transition-all duration-300 rounded-none ${showOrderSummary ? "border-primary shadow-md" : ""
                }`}
              onClick={() => setShowOrderSummary(!showOrderSummary)}
              aria-expanded={showOrderSummary}
              aria-controls="mobile-order-summary"
            >
              <div className="flex items-center">
                <ShoppingBag className={`mr-2 h-4 w-4 ${showOrderSummary ? "" : "text-primary"}`} />
                <span>Order Summary</span>
                <span className="ml-2 text-sm text-pretty">
                  ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </span>
              </div>
              <div className="flex items-center">
                <span className={`font-semibold mr-2 ${showOrderSummary ? "" : "text-primary"}`}>
                  {total.toFixed(2)} Tk
                </span>
                <div className={`rounded-none p-1 transition-colors duration-300 ${showOrderSummary ? "" : "bg-muted"
                  }`}>
                  {showOrderSummary ? (
                    <ChevronUp className="h-4 w-4 transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                  )}
                </div>
              </div>
            </Button>

            {/* Mobile Order Summary - Displayed below toggle on small screens */}
            <div
              id="mobile-order-summary"
              className={`${showOrderSummary ? 'block' : 'hidden'} md:hidden mt-4 mb-6 transition-all duration-300`}
            >
              <Card className="overflow-hidden rounded-none border-2">
                <CardContent className="p-3 space-y-4">
                  {/* Items List - Fixed height with scroll */}
                  <div className="border-2 rounded-none overflow-hidden bg-card/50 mt-3">
                    <div className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-3">
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <div key={`${item.isCombo ? item.comboCode : item.productCode}-${item.selectedSize || 'default'}`} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                            <div className="relative w-14 h-14 rounded-none overflow-hidden border-2 bg-card flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{item.name}</h4>
                              <div className="flex flex-col gap-0.5">
                                {item.selectedSize && (
                                  <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                                )}
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              
                              {/* Show combo items */}
                              {item.isCombo && item.products && item.products.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  <p className="text-xs font-medium">Includes:</p>
                                  <ul className="list-disc pl-4 mt-0.5">
                                    {item.products.map((product, idx) => (
                                      <li key={idx} className="text-xs">
                                        {product.name} {product.size && `(${product.size})`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <p className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} Tk</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-3 text-center text-sm text-muted-foreground">
                          Your cart is empty
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{subtotal.toFixed(2)} Tk</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-primary">
                        <span className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {appliedCoupon.type === 'percentage'
                            ? `Discount (${appliedCoupon.discount * 100}%)`
                            : 'Discount'}
                        </span>
                        <span>-{discountAmount.toFixed(2)} Tk</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shippingPrice.toFixed(2)} Tk</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-primary">{total.toFixed(2)} Tk</span>
                    </div>

                    {appliedCoupon && (
                      <div className="mt-1 flex justify-center">
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-none">
                          {appliedCoupon.code} applied
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Checkout Forms */}
            <div className="md:col-span-2 space-y-8">
              {/* Checkout Steps Tabs */}
              <Tabs value={activeStep} className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-none p-0 h-12">
                  <TabsTrigger
                    value="shipping"
                    onClick={() => setActiveStep('shipping')}
                    disabled={isSubmitting}
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full"
                  >
                    <motion.div 
                      className="flex items-center"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Shipping
                    </motion.div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    onClick={() => setActiveStep('payment')}
                    disabled={activeStep !== 'payment' || isSubmitting}
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-full"
                  >
                    <motion.div 
                      className="flex items-center"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Payment
                    </motion.div>
                  </TabsTrigger>
                </TabsList>

                {/* Shipping Information Tab */}
                <AnimatePresence mode="wait">
                  {activeStep === 'shipping' && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabsContent value="shipping" className="space-y-6 pt-4">
                        <form onSubmit={handleSubmit(onSubmitShipping)} id="shippingForm">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Card className="rounded-none border-2">
                              <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                                <CardDescription>
                                  Enter your shipping address and contact details
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                  <h3 className="text-base font-medium">Contact Information</h3>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                                      <Input
                                        id="name"
                                        placeholder="Enter your full name"
                                        className="rounded-none"
                                        {...register('name', { required: 'Full name is required' })}
                                        error={errors.name?.message}
                                      />
                                      {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name.message}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                                      <Input
                                        id="phone"
                                        placeholder="Enter your phone number"
                                        className="rounded-none"
                                        {...register('phone', { required: 'Phone number is required' })}
                                        error={errors.phone?.message}
                                      />
                                      {errors.phone && (
                                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      placeholder="Enter your email"
                                      className="rounded-none"
                                      {...register('email', {
                                        pattern: {
                                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                          message: 'Invalid email address'
                                        }
                                      })}
                                      error={errors.email?.message}
                                    />
                                    {errors.email && (
                                      <p className="text-sm text-destructive">{errors.email.message}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="space-y-4">
                                  <h3 className="text-base font-medium">Shipping Address</h3>

                                  <div className="space-y-2">
                                    <Label htmlFor="address">Street Address <span className="text-destructive">*</span></Label>
                                    <textarea
                                      id="address"
                                      className="flex w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      placeholder="Enter your complete address"
                                      rows={3}
                                      {...register('address', { required: 'Address is required' })}
                                    />
                                    {errors.address && (
                                      <p className="text-sm text-destructive">{errors.address.message}</p>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                                    <Input
                                      id="city"
                                      placeholder="Enter your city"
                                      className="rounded-none"
                                      {...register('city', { required: 'City is required' })}
                                      error={errors.city?.message}
                                    />
                                    {errors.city && (
                                      <p className="text-sm text-destructive">{errors.city.message}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Save Information */}
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="saveInfo" {...register('saveInfo')} className="rounded-none" />
                                  <label
                                    htmlFor="saveInfo"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Save this information for next time
                                  </label>
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between">
                                <Button variant="outline" type="button" asChild className="rounded-none">
                                  <Link href="/cart">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Cart
                                  </Link>
                                </Button>
                                <Button type="submit" className="rounded-none">
                                  Continue to Payment
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        </form>

                        {/* Shipping Methods */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Card className="rounded-none border-2">
                            <CardHeader>
                              <CardTitle>Shipping Method</CardTitle>
                              <CardDescription>
                                Select your preferred shipping method
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <RadioGroup
                                value={shippingMethod}
                                onValueChange={setShippingMethod}
                                className="space-y-3"
                              >
                                {shippingMethods.map((method) => (
                                  <motion.div
                                    key={method.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`flex items-center justify-between rounded-none border-2 p-4 
                                      ${shippingMethod === method.id ? 'border-primary bg-primary/5' : 'border-border'}
                                      cursor-pointer
                                    `}
                                    onClick={() => setShippingMethod(method.id)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <RadioGroupItem
                                        value={method.id}
                                        id={`shipping-${method.id}`}
                                        className="cursor-pointer"
                                      />
                                      <Label
                                        htmlFor={`shipping-${method.id}`}
                                        className="flex flex-col cursor-pointer"
                                      >
                                        <span className="font-medium">{method.name}</span>
                                        <span className="text-sm text-muted-foreground">{method.deliveryTime}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {method.areas.join(', ')}
                                        </span>
                                      </Label>
                                    </div>
                                    <span className="font-medium">
                                      {method.price} Tk
                                    </span>
                                  </motion.div>
                                ))}
                              </RadioGroup>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </TabsContent>
                    </motion.div>
                  )}

                  {/* Payment Tab */}
                  {activeStep === 'payment' && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabsContent value="payment" className="space-y-6 pt-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Card className="rounded-none border-2">
                            <CardHeader>
                              <CardTitle>Payment Method</CardTitle>
                              <CardDescription>
                                Choose how you want to pay
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <RadioGroup
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                                className="space-y-3"
                              >
                                {paymentMethods.map((method) => (
                                  <motion.div
                                    key={method.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`flex items-center space-x-3 rounded-none border-2 p-4 cursor-pointer
                                      ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border'}
                                    `}
                                    onClick={() => setPaymentMethod(method.id)}
                                  >
                                    <RadioGroupItem
                                      value={method.id}
                                      id={`payment-${method.id}`}
                                      className="cursor-pointer"
                                    />
                                    <Label
                                      htmlFor={`payment-${method.id}`}
                                      className="flex items-center space-x-2 cursor-pointer flex-1"
                                    >
                                      <div className="w-8 h-8 flex items-center justify-center">
                                        {method.icon}
                                      </div>
                                      <span className="font-medium">{method.name}</span>
                                    </Label>
                                  </motion.div>
                                ))}
                              </RadioGroup>

                              {/* Payment Method Details - Cash on Delivery is shown by default */}
                              <AnimatePresence mode="wait">
                                {/* Cash on Delivery Information */}
                                {paymentMethod === 'cod' && (
                                  <motion.div 
                                    key="cod-details"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 space-y-4 p-4 border-2 rounded-none bg-card/50"
                                  >
                                    <h4 className="font-medium mb-1">Cash on Delivery Information</h4>
                                    <div className="space-y-3">
                                      <div className="bg-muted/40 p-3 rounded-none">
                                        <p className="text-sm">
                                          Pay with cash upon delivery of your order. Please have the exact amount ready.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Note: Cash on Delivery may not be available for certain products or delivery areas.
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* MFS Payment Form (bKash/Nagad) */}
                                {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                                  <motion.div 
                                    key="mfs-details"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 space-y-4 p-4 border-2 rounded-none bg-card/50"
                                  >
                                    <h4 className="font-medium mb-1">{paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions</h4>
                                    <div className="space-y-4">
                                      <div className="bg-muted/40 p-3 rounded-none">
                                        <p className="text-sm">
                                          Please send the payment to the following {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} number:
                                        </p>
                                        <div className="font-medium mt-1 text-center p-2 bg-primary/5 rounded-none border-2 border-primary/20">
                                          {paymentMethod === 'bkash' ? '01724318584' : '01778053337'}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          After sending the payment, please provide the Transaction ID (TrxID) below or upload a screenshot of the payment confirmation.
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="transactionId">Transaction ID (TrxID) <span className="text-destructive">*</span></Label>
                                        <Input
                                          id="transactionId"
                                          placeholder="e.g. 9HV7AB5DTX"
                                          value={mfsDetails.transactionId}
                                          onChange={(e) => setMfsDetails({ ...mfsDetails, transactionId: e.target.value })}
                                          required
                                          className="rounded-none"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Transaction ID is required to verify your payment.
                                        </p>
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            id="screenshot"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                setMfsDetails({ ...mfsDetails, screenshot: file });
                                                const reader = new FileReader();
                                                reader.onload = (e) => setScreenshotPreview(e.target.result);
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                            className="flex-1 rounded-none"
                                          />
                                        </div>

                                        {screenshotPreview && (
                                          <div className="mt-2 relative">
                                            <div className="relative h-40 border-2 rounded-none overflow-hidden">
                                              <Image
                                                src={screenshotPreview}
                                                alt="Payment screenshot"
                                                fill
                                                sizes="100%"
                                                className="object-contain"
                                              />
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="absolute top-1 right-1 h-6 w-6 p-0 rounded-none"
                                              onClick={() => {
                                                setScreenshotPreview('');
                                                setMfsDetails({ ...mfsDetails, screenshot: null });
                                              }}
                                            >
                                              &times;
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>

                        {/* Review and Place Order */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <Card className="rounded-none border-2">
                            <CardHeader>
                              <CardTitle>Review and Place Order</CardTitle>
                              <CardDescription>
                                Please check all details before placing your order
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Total Amount:</span>
                                <span className="text-lg font-bold text-primary">{total.toFixed(2)} Tk</span>
                              </div>

                              <div className="space-y-3 border-t pt-3 mt-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="combinedPolicy"
                                    checked={policyAccepted}
                                    onCheckedChange={setPolicyAccepted}
                                    className="rounded-none"
                                  />
                                  <label
                                    htmlFor="combinedPolicy"
                                    className="text-sm text-muted-foreground"
                                  >
                                    I agree to the <button 
                                      type="button" 
                                      onClick={() => setShowTermsDialog(true)} 
                                      className="text-primary hover:underline focus:outline-none"
                                    >
                                      Terms and Conditions
                                    </button> and <button 
                                      type="button" 
                                      onClick={() => setShowReturnPolicyDialog(true)} 
                                      className="text-primary hover:underline focus:outline-none"
                                    >
                                      Return Policy
                                    </button>
                                  </label>
                                </div>
                              </div>
                            </CardContent>

                            <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => setActiveStep('shipping')}
                                disabled={isSubmitting}
                                className="rounded-none"
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Shipping
                              </Button>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                  className="w-full sm:w-auto rounded-none"
                                  onClick={onSubmitPayment}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>Place Order</>
                                  )}
                                </Button>
                              </motion.div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      </TabsContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tabs>
            </div>

            {/* Order Summary - Desktop only */}
            <div className="hidden md:block">
              <div className="md:sticky md:top-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="overflow-hidden rounded-none border-2">
                    <CardHeader className="pb-2">
                      <CardTitle>Order Summary</CardTitle>
                      <CardDescription>
                        {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {/* Items List - Fixed height with scroll */}
                      <div className="border-2 rounded-none overflow-hidden bg-card/50">
                        <div className="max-h-[320px] overflow-y-auto px-3 py-2 space-y-3">
                          {cartItems.length > 0 ? (
                            cartItems.map((item) => (
                              <div key={`${item.isCombo ? item.comboCode : item.productCode}-${item.selectedSize || 'default'}`} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                <div className="relative w-16 h-16 rounded-none overflow-hidden border-2 bg-card flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">{item.name}</h4>
                                  <div className="flex flex-col gap-0.5">
                                    {item.selectedSize && (
                                      <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                  
                                  {/* Show combo items */}
                                  {item.isCombo && item.products && item.products.length > 0 && (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      <p className="text-xs font-medium">Includes:</p>
                                      <ul className="list-disc pl-4 mt-0.5">
                                        {item.products.map((product, idx) => (
                                          <li key={idx} className="text-xs">
                                            {product.name} {product.size && `(${product.size})`}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  <p className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} Tk</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-3 text-center text-sm text-muted-foreground">
                              Your cart is empty
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Price Summary */}
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{subtotal.toFixed(2)} Tk</span>
                        </div>

                        {appliedCoupon && (
                          <div className="flex justify-between text-sm text-primary">
                            <span className="flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              {appliedCoupon.type === 'percentage'
                                ? `Discount (${appliedCoupon.discount * 100}%)`
                                : 'Discount'}
                            </span>
                            <span>-{discountAmount.toFixed(2)} Tk</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>{shippingPrice.toFixed(2)} Tk</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                          <span className="font-medium">Total</span>
                          <span className="font-bold text-primary">{total.toFixed(2)} Tk</span>
                        </div>

                        {appliedCoupon && (
                          <div className="mt-1 flex justify-center">
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-none">
                              {appliedCoupon.code} applied
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Safe Checkout Message */}
                      <div className="bg-muted/30 p-3 rounded-none mt-1">
                        <h4 className="text-sm font-medium flex items-center mb-1">
                          <Shield className="h-4 w-4 mr-2 text-primary" />
                          Secure Checkout
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your payment information is processed securely.
                        </p>
                      </div>

                      {/* Payment Methods Icons */}
                      <div className="flex justify-center mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-5 bg-card/80 border rounded-none flex items-center justify-center">
                            <Image src="/payment/bkash.svg" width={16} height={10} alt="bKash" />
                          </div>
                          <div className="w-8 h-5 bg-card/80 border rounded-none flex items-center justify-center">
                            <Image src="/payment/nagad.svg" width={16} height={10} alt="Nagad" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Need Help? */}
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="rounded-none border-2 max-w-2xl max-h-[80vh] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader className="border-b pb-4 relative">
              <button 
                onClick={() => setShowTermsDialog(false)} 
                className="absolute right-0 top-0 p-2 hover:bg-muted/50 transition-colors rounded-none"
              >
                <X className="h-4 w-4" />
              </button>
              <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
              <DialogDescription>
                Please read our terms and conditions carefully
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto py-4 pr-2 max-h-[50vh] custom-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">1. Introduction</h3>
                <p className="text-sm text-muted-foreground">
                  Welcome to Selzio. These terms and conditions govern your use of our website and services. 
                  By accessing or using our website, you agree to be bound by these terms and conditions. 
                  If you disagree with any part of these terms, you may not access the website.
                </p>
                
                <h3 className="text-lg font-semibold">2. Definitions</h3>
                <p className="text-sm text-muted-foreground">
                  "Company", "we", "us", or "our" refers to Selzio.
                  "Customer", "you", or "your" refers to the person accessing or using our website and services.
                  "Products" refers to the items available for purchase on our website.
                  "Order" refers to a request by you to purchase products from us.
                </p>
                
                <h3 className="text-lg font-semibold">3. Products and Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  All products displayed on our website are subject to availability. We reserve the right to discontinue any product at any time.
                  Prices for products are subject to change without notice. We shall not be liable to you or any third party for any price changes.
                  We take reasonable steps to ensure that all information on our website about products, including prices, is accurate. However, errors may occur. If we discover an error in the price of products you have ordered, we will inform you as soon as possible and give you the option of reconfirming your order at the correct price or canceling it.
                </p>
                
                <h3 className="text-lg font-semibold">4. Orders and Payment</h3>
                <p className="text-sm text-muted-foreground">
                  When you place an order, you are making an offer to purchase products. We may or may not accept your offer at our discretion.
                  Payment for all orders must be made in full at the time of ordering. You may pay using the methods specified on our website.
                  By submitting an order, you warrant that you are legally capable of entering into binding contracts.
                </p>
                
                <h3 className="text-lg font-semibold">5. Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  We will deliver the products to the address you specify when placing your order.
                  Delivery times are estimates only and are not guaranteed. We will not be liable for any delay or failure to deliver products within the estimated timeframes.
                  Risk of loss and title for products pass to you upon delivery.
                </p>
                
                <h3 className="text-lg font-semibold">6. Cancellation and Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  You may cancel your order before it is dispatched. Once an order has been dispatched, you must follow our returns policy.
                  Refunds will be processed within 14 days of our receipt of the returned products or your cancellation request, as applicable.
                </p>
                
                <h3 className="text-lg font-semibold">7. Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  We collect and process your personal data in accordance with our Privacy Policy, which is available on our website.
                </p>
                
                <h3 className="text-lg font-semibold">8. Limitation of Liability</h3>
                <p className="text-sm text-muted-foreground">
                  To the fullest extent permitted by law, we exclude all liability for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our website and services.
                </p>
                
                <h3 className="text-lg font-semibold">9. Changes to Terms</h3>
                <p className="text-sm text-muted-foreground">
                  We may revise these terms and conditions at any time by updating this page. By continuing to use our website after any changes, you agree to be bound by the revised terms and conditions.
                </p>
                
                <h3 className="text-lg font-semibold">10. Governing Law</h3>
                <p className="text-sm text-muted-foreground">
                  These terms and conditions are governed by and construed in accordance with the laws of Bangladesh, and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Bangladesh.
                </p>
              </motion.div>
            </div>
            <DialogFooter className="border-t pt-4 flex justify-end">
              <Button 
                className="rounded-none hover:bg-primary/90 transition-colors" 
                onClick={() => setShowTermsDialog(false)}
              >
                I Understand
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Return Policy Dialog */}
      <Dialog open={showReturnPolicyDialog} onOpenChange={setShowReturnPolicyDialog}>
        <DialogContent className="rounded-none border-2 max-w-2xl max-h-[80vh] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader className="border-b pb-4 relative">
              <button 
                onClick={() => setShowReturnPolicyDialog(false)} 
                className="absolute right-0 top-0 p-2 hover:bg-muted/50 transition-colors rounded-none"
              >
                <X className="h-4 w-4" />
              </button>
              <DialogTitle className="text-xl font-bold">Return Policy</DialogTitle>
              <DialogDescription>
                Please read our return policy carefully
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto py-4 pr-2 max-h-[50vh] custom-scrollbar">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">1. Return Period</h3>
                <p className="text-sm text-muted-foreground">
                  You have 7 days from the date of delivery to return a product for a full refund or exchange.
                  After this period, we cannot accept returns unless the product is defective.
                </p>
                
                <h3 className="text-lg font-semibold">2. Return Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  Products must be returned in their original condition and packaging.
                  Products must be unused, unworn, and with all tags attached.
                  Products must not be damaged, altered, or washed.
                  Products must include all accessories and free gifts that came with them.
                </p>
                
                <h3 className="text-lg font-semibold">3. Non-Returnable Items</h3>
                <p className="text-sm text-muted-foreground">
                  For hygiene reasons, we cannot accept returns on:
                  - Underwear and intimate apparel
                  - Swimwear
                  - Beauty products that have been opened or used
                  - Products marked as "Final Sale" or "Non-Returnable"
                </p>
                
                <h3 className="text-lg font-semibold">4. Return Process</h3>
                <p className="text-sm text-muted-foreground">
                  To initiate a return, please contact our customer service team through the "Contact Us" page on our website.
                  You will need to provide your order number, the items you wish to return, and the reason for the return.
                  We will provide you with a return authorization and instructions on how to return the products.
                  You are responsible for the cost of returning the products unless the products are defective or we sent you the wrong items.
                </p>
                
                <h3 className="text-lg font-semibold">5. Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  Refunds will be processed within 14 days of our receipt of the returned products.
                  Refunds will be issued to the original payment method used for the purchase.
                  Shipping costs are non-refundable unless the products are defective or we sent you the wrong items.
                  If you received free shipping on your order, the standard shipping cost will be deducted from your refund.
                </p>
                
                <h3 className="text-lg font-semibold">6. Exchanges</h3>
                <p className="text-sm text-muted-foreground">
                  If you wish to exchange a product for a different size or color, please follow the same process as for returns.
                  Exchanges are subject to availability.
                  If the product you want is not available for exchange, we will issue a refund.
                </p>
                
                <h3 className="text-lg font-semibold">7. Damaged or Defective Products</h3>
                <p className="text-sm text-muted-foreground">
                  If you receive a damaged or defective product, please contact our customer service team within 48 hours of delivery.
                  We may ask for photographs of the damaged or defective product.
                  We will arrange for the product to be collected and replaced or refunded, as you prefer.
                </p>
                
                <h3 className="text-lg font-semibold">8. Changes to Return Policy</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify this return policy at any time. Any changes will be effective immediately upon posting on our website.
                </p>
              </motion.div>
            </div>
            <DialogFooter className="border-t pt-4 flex justify-end">
              <Button 
                className="rounded-none hover:bg-primary/90 transition-colors" 
                onClick={() => setShowReturnPolicyDialog(false)}
              >
                I Understand
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 