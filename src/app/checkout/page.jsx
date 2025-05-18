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
import { ShoppingBag, CreditCard, Truck, Shield, ArrowLeft, Check, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'bkash', name: 'bKash', icon: <Image src="/payment/bkash.svg" width={24} height={24} alt="bKash" /> },
  { id: 'nagad', name: 'Nagad', icon: <Image src="/payment/nagad.svg" width={24} height={24} alt="Nagad" /> },
  { id: 'cod', name: 'Cash on Delivery', icon: <Image src="/payment/cash-on-delivery.svg" width={24} height={24} alt="Cash on Delivery" /> }
];

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading, api } = useAuth();
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState('shipping');
  const [shippingMethod, setShippingMethod] = useState('dhaka');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [mfsDetails, setMfsDetails] = useState({
    transactionId: '',
    screenshot: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // React Hook Form for shipping information
  const { register, handleSubmit, setValue, formState: { errors }, getValues } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
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
          console.log('Loaded coupon from session storage:', parsedCoupon);
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

          console.log('Loaded saved shipping information');
        } catch (error) {
          console.error('Error parsing saved shipping data:', error);
          // Fall back to basic user info if saved data is corrupted

          // Split the name into first and last name (assuming the format is "First Last")
          const nameParts = user.name ? user.name.split(' ') : ['', ''];
          setValue('firstName', nameParts[0] || '');
          setValue('lastName', nameParts.slice(1).join(' ') || '');
          setValue('email', user.email || '');
          setValue('phone', user.phone || '');
          setValue('address', user.address || '');
        }
      } else {
        // If no saved info, fall back to basic user info
        const nameParts = user.name ? user.name.split(' ') : ['', ''];
        setValue('firstName', nameParts[0] || '');
        setValue('lastName', nameParts.slice(1).join(' ') || '');
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
        console.log('Not authenticated, redirecting to login');
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
        console.log('Cart is empty, redirecting to cart page');
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
    console.log('Shipping data:', data);

    // Save shipping info to localStorage if the checkbox is checked
    if (data.saveInfo && isAuthenticated && user) {
      try {
        // Store shipping details for future use
        const shippingDataToSave = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          saveInfo: true
        };

        localStorage.setItem(`shipping_info_${user.email}`, JSON.stringify(shippingDataToSave));
        console.log('Shipping information saved for future use');
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

      console.log('Preparing to upload file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Create form data for uploading
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Cloudinary using environment variables
      const response = await api.post('/api/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to upload image');
      }

      console.log('Cloudinary upload successful:', response.data);
      
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
      const response = await api.post('/api/orders', orderData);
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  };

  const onSubmitPayment = async () => {
    // Validate terms and return policy
    if (!policyAccepted) {
      toast({
        title: 'Agreements Required',
        description: 'Please agree to the Terms and Conditions and Return Policy.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate based on payment method
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!mfsDetails.transactionId) {
        toast({
          title: 'Transaction ID Required',
          description: 'Please provide the Transaction ID for your payment.',
          variant: 'destructive'
        });
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast({
          title: 'Card Details Required',
          description: 'Please fill in all card details.',
          variant: 'destructive'
        });
        return;
      }
    } else if (paymentMethod === 'cod') {
      // No additional validation for COD
    }
    
    setIsSubmitting(true);
    
    try {
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
        paymentMethod === 'card' ? {
          method: 'card',
          cardDetails: {
            cardholderName: cardDetails.cardName,
            lastFourDigits: cardDetails.cardNumber.slice(-4),
            expiryDate: cardDetails.expiryDate,
          },
          paymentStatus: 'paid'
        } : 
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
        paymentMethod === 'cod' ? 'processing' : 'paid';
      
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
      
      console.log('Creating order with data:', orderData);
      
      // Create order in database
      const createdOrder = await createOrder(orderData);
      console.log('Order created successfully:', createdOrder);
      
      // Show success toast for order processing
      toast({
        title: 'Order Submitted',
        description: paymentMethod === 'bkash' || paymentMethod === 'nagad' 
          ? 'Your order has been placed and is awaiting payment verification.' 
          : 'Your order has been placed successfully.',
        variant: 'success'
      });
      
      // Clear cart and coupon, store payment method, then redirect to success page
      clearCart();
      sessionStorage.removeItem('appliedCoupon');
      
      // Store payment method for success page to display appropriate message
      sessionStorage.setItem('payment_method', paymentMethod);
      
      // Also store the order ID for the success page
      if (createdOrder && createdOrder._id) {
        sessionStorage.setItem('last_order_id', createdOrder._id);
      }
      
      // Short timeout to let the toast be visible before redirect
      setTimeout(() => {
        router.push('/checkout/success');
      }, 1500);
    } catch (error) {
      console.error('Order submission error:', error);
      
      toast({
        title: 'Order Submission Failed',
        description: error.message || 'There was an error processing your order. Please try again.',
        variant: 'destructive'
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

  // Debug auth state and cart
  useEffect(() => {
    console.log('Checkout page - Auth state:', {
      isAuthenticated,
      authLoading,
      hasUser: !!user,
      cartItemCount: cartItems.length
    });

    // Also check for redirect URL in session storage
    if (typeof window !== 'undefined') {
      const redirectUrl = sessionStorage.getItem('auth_redirect');
      if (redirectUrl) {
        console.log('Stored redirect URL found:', redirectUrl);
      }
    }
  }, [isAuthenticated, authLoading, user, cartItems]);

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
              className={`w-full flex items-center justify-between transition-all duration-300 ${showOrderSummary ? "border-primary shadow-md" : ""
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
                <div className={`rounded-full p-1 transition-colors duration-300 ${showOrderSummary ? "" : "bg-muted"
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
              <Card className="overflow-hidden">
                <CardContent className="p-3 space-y-4">
                  {/* Items List - Fixed height with scroll */}
                  <div className="border rounded-md overflow-hidden bg-card/50 mt-3">
                    <div className="max-h-[200px] overflow-y-auto px-3 py-2 space-y-3">
                      {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                            <div className="relative w-14 h-14 rounded-md overflow-hidden border bg-card flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
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
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="shipping"
                    onClick={() => setActiveStep('shipping')}
                    disabled={isSubmitting}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Shipping
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    onClick={() => setActiveStep('payment')}
                    disabled={activeStep !== 'payment' || isSubmitting}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment
                  </TabsTrigger>
                </TabsList>

                {/* Shipping Information Tab */}
                <TabsContent value="shipping" className="space-y-6 pt-4">
                  <form onSubmit={handleSubmit(onSubmitShipping)} id="shippingForm">
                    <Card>
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
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                placeholder="Enter your first name"
                                {...register('firstName', { required: 'First name is required' })}
                                error={errors.firstName?.message}
                              />
                              {errors.firstName && (
                                <p className="text-sm text-destructive">{errors.firstName.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                placeholder="Enter your last name"
                                {...register('lastName', { required: 'Last name is required' })}
                                error={errors.lastName?.message}
                              />
                              {errors.lastName && (
                                <p className="text-sm text-destructive">{errors.lastName.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email', {
                                  required: 'Email is required',
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

                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                placeholder="Enter your phone number"
                                {...register('phone', { required: 'Phone number is required' })}
                                error={errors.phone?.message}
                              />
                              {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone.message}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">Shipping Address</h3>

                          <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                              id="address"
                              placeholder="Enter your address"
                              {...register('address', { required: 'Address is required' })}
                              error={errors.address?.message}
                            />
                            {errors.address && (
                              <p className="text-sm text-destructive">{errors.address.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                placeholder="Enter your city"
                                {...register('city', { required: 'City is required' })}
                                error={errors.city?.message}
                              />
                              {errors.city && (
                                <p className="text-sm text-destructive">{errors.city.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="state">State/District</Label>
                              <Input
                                id="state"
                                placeholder="Enter your state"
                                {...register('state', { required: 'State is required' })}
                                error={errors.state?.message}
                              />
                              {errors.state && (
                                <p className="text-sm text-destructive">{errors.state.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="zipCode">Postal Code</Label>
                              <Input
                                id="zipCode"
                                placeholder="Enter your postal code"
                                {...register('zipCode', { required: 'Postal code is required' })}
                                error={errors.zipCode?.message}
                              />
                              {errors.zipCode && (
                                <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Save Information */}
                        <div className="flex items-center space-x-2">
                          <Checkbox id="saveInfo" {...register('saveInfo')} />
                          <label
                            htmlFor="saveInfo"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Save this information for next time
                          </label>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" asChild>
                          <Link href="/cart">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Cart
                          </Link>
                        </Button>
                        <Button type="submit">
                          Continue to Payment
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>

                  {/* Shipping Methods */}
                  <Card>
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
                          <div
                            key={method.id}
                            className={`flex items-center justify-between rounded-lg border p-4 
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
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-6 pt-4">
                  <Card>
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
                          <div
                            key={method.id}
                            className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer
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
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Credit Card Form - Only shown when card payment is selected */}
                      {paymentMethod === 'card' && (
                        <div className="mt-6 space-y-4 p-4 border rounded-lg bg-card/50">
                          <h4 className="font-medium mb-3">Card Details</h4>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.cardNumber}
                                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardName">Name on Card</Label>
                              <Input
                                id="cardName"
                                placeholder="John Doe"
                                value={cardDetails.cardName}
                                onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  value={cardDetails.expiryDate}
                                  onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MFS Payment Form (bKash/Nagad) */}
                      {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                        <div className="mt-6 space-y-4 p-4 border rounded-lg bg-card/50">
                          <h4 className="font-medium mb-1">{paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions</h4>
                          <div className="space-y-4">
                            <div className="bg-muted/40 p-3 rounded-lg">
                              <p className="text-sm">
                                Please send the payment to the following {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} number:
                              </p>
                              <div className="font-medium mt-1 text-center p-2 bg-primary/5 rounded border border-primary/20">
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
                                  className="flex-1"
                                />
                              </div>

                              {screenshotPreview && (
                                <div className="mt-2 relative">
                                  <div className="relative h-40 border rounded-lg overflow-hidden">
                                    <Image
                                      src={screenshotPreview}
                                      alt="Payment screenshot"
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                                    onClick={() => {
                                      setScreenshotPreview('');
                                      setMfsDetails({ ...mfsDetails, screenshot: null });
                                    }}
                                  >
                                    &times;
                                  </Button>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground mt-1">
                                Our team will verify your payment and process your order once confirmed. You'll receive an email notification when your payment is verified.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cash on Delivery Information */}
                      {paymentMethod === 'cod' && (
                        <div className="mt-6 space-y-4 p-4 border rounded-lg bg-card/50">
                          <h4 className="font-medium mb-1">Cash on Delivery Information</h4>
                          <div className="space-y-3">
                            <div className="bg-muted/40 p-3 rounded-lg">
                              <p className="text-sm">
                                Pay with cash upon delivery of your order. Please have the exact amount ready.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Note: Cash on Delivery may not be available for certain products or delivery areas.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Review and Place Order */}
                  <Card>
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

                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <p className="flex items-center text-muted-foreground">
                          <Shield className="h-4 w-4 mr-2" />
                          Your payment information is processed securely. We do not store credit card details.
                        </p>
                      </div>

                      <div className="space-y-3 border-t pt-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="combinedPolicy"
                            checked={policyAccepted}
                            onCheckedChange={setPolicyAccepted}
                          />
                          <label
                            htmlFor="combinedPolicy"
                            className="text-sm text-muted-foreground"
                          >
                            I agree to the <Link href="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and <Link href="/returns" className="text-primary hover:underline">Return Policy</Link>
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
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Shipping
                      </Button>
                      <Button
                        className="w-full sm:w-auto"
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
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Order Summary - Desktop only */}
            <div className="hidden md:block">
              <div className="md:sticky md:top-20">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>
                      {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Items List - Fixed height with scroll */}
                    <div className="border rounded-md overflow-hidden bg-card/50">
                      <div className="max-h-[320px] overflow-y-auto px-3 py-2 space-y-3">
                        {cartItems.length > 0 ? (
                          cartItems.map((item) => (
                            <div key={item.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                              <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-card flex-shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
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
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {appliedCoupon.code} applied
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Safe Checkout Message */}
                    <div className="bg-muted/30 p-3 rounded-lg mt-1">
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
                        <div className="w-8 h-5 bg-card/80 border rounded flex items-center justify-center">
                          <Image src="/payment/visa.svg" width={16} height={10} alt="Visa" />
                        </div>
                        <div className="w-8 h-5 bg-card/80 border rounded flex items-center justify-center">
                          <Image src="/payment/mastercard.svg" width={16} height={10} alt="Mastercard" />
                        </div>
                        <div className="w-8 h-5 bg-card/80 border rounded flex items-center justify-center">
                          <Image src="/payment/bkash.svg" width={16} height={10} alt="bKash" />
                        </div>
                        <div className="w-8 h-5 bg-card/80 border rounded flex items-center justify-center">
                          <Image src="/payment/nagad.svg" width={16} height={10} alt="Nagad" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
    </div>
  );
} 