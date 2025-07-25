"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { getDiscountedPrice } from '@/lib/utils';

// Import components from checkout component library
import {
  OrderSummary,
  TermsDialog,
  ReturnPolicyDialog,
  ShippingSection,
  PaymentSection,
  ReviewSection,
  shippingMethods,
  paymentMethods
} from '@/components/checkout';

export default function CheckoutPage() {
  const { user, isAuthenticated, api } = useAuth();
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showReturnPolicyDialog, setShowReturnPolicyDialog] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Form management using React Hook Form
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      shippingMethod: 'dhaka',
      paymentMethod: 'cod',
      transactionId: '',
      policyAccepted: false,
      saveInfo: isAuthenticated,
    }
  });

  // Get current values from the form
  const selectedShippingMethod = watch('shippingMethod');
  const selectedPaymentMethod = watch('paymentMethod');
  const policyAccepted = watch('policyAccepted');
  
  // Register policyAccepted field with validation
  useEffect(() => {
    register('policyAccepted', { 
      required: 'You must accept the terms and conditions' 
    });
  }, [register]);

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
        }
      }
    }
  }, []);

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // First try to load saved shipping information from localStorage
      const savedShippingInfo = localStorage.getItem(`shipping_info_${user.email}`);

      if (savedShippingInfo) {
        try {
          const parsedInfo = JSON.parse(savedShippingInfo);

          // Set form values from saved data
          Object.entries(parsedInfo).forEach(([field, value]) => {
            if (field !== 'saveInfo') { // Don't override the saveInfo default value
              setValue(field, value);
            }
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

  // Calculate total product discount (separate from coupon discounts)
  const calculateTotalProductDiscount = () => {
    return cartItems.reduce((sum, item) => {
      if (item.discount && item.discount > 0) {
        const originalPrice = item.price * item.quantity;
        const discountedPrice = getDiscountedPrice(item.price, item.discount) * item.quantity;
        return sum + (originalPrice - discountedPrice);
      }
      return sum;
    }, 0);
  };
  
  const totalProductDiscount = calculateTotalProductDiscount();

  // Redirect if cart is empty
  useEffect(() => {
    // Add a delay to ensure cart is fully loaded
    const cartCheckTimer = setTimeout(() => {
      if (cartItems.length === 0) {
        router.push('/cart');
      }
    }, 1500);

    return () => clearTimeout(cartCheckTimer);
  }, [cartItems, router]);

  // Calculate final price
  const selectedShipping = shippingMethods.find(method => method.id === selectedShippingMethod);
  const shippingPrice = selectedShipping?.price || 0;
  const subtotal = totalPrice;
  const total = subtotal + shippingPrice - discountAmount;

  // Initialize page
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setInitializing(false);
    }, 1000);

    return () => clearTimeout(initTimer);
  }, []);

  // Function to upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return '';
    
    try {
      // Validate file
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

      // Upload to Cloudinary
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
      return '';
    }
  };

  // Function to create order in database
  const createOrder = async (orderData) => {
    try {
      // If user is authenticated, include the auth token
      if (isAuthenticated) {
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        }
      } else {
        // For guest checkout, remove any existing auth headers
        delete api.defaults.headers.common['Authorization'];
      }
      
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.error || 'Failed to create order');
    }
  };

  // Handle form submission
  const onSubmitOrder = async (data) => {
    // Validate terms acceptance
    if (!policyAccepted) {
      toast({
        title: "Agreements Required",
        description: "Please agree to the Terms and Conditions and Return Policy.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate transaction ID for mobile payments
    if ((data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad') && !data.transactionId) {
      toast({
        title: "Transaction ID Required",
        description: "Please provide the Transaction ID for your payment.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle payment screenshot upload if exists
      let paymentImageUrl = '';
      const screenshotFile = data.paymentScreenshot?.[0];
      
      if (screenshotFile && (data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad')) {
        paymentImageUrl = await uploadImageToCloudinary(screenshotFile);
      }
      
      // Save shipping info if requested
      if (data.saveInfo && isAuthenticated && user) {
        try {
          // Store shipping details for future use
          const shippingDataToSave = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city
          };
          localStorage.setItem(`shipping_info_${user.email}`, JSON.stringify(shippingDataToSave));
        } catch (error) {
          console.error('Error saving shipping information:', error);
        }
      }
      
      // Prepare payment details based on method
      const paymentDetails = 
        (data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad') ? {
          method: data.paymentMethod,
          transactionId: data.transactionId,
          paymentScreenshot: paymentImageUrl,
          paymentNumber: data.paymentMethod === 'bkash' ? '01724318584' : '01778053337',
          paymentStatus: 'pending' // Requires admin verification
        } : 
        data.paymentMethod === 'cod' ? { 
          method: 'cod',
          paymentStatus: 'pending' 
        } : null;
      
      // Determine order status based on payment method
      const orderStatus = 
        (data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad') ? 'awaiting_payment_verification' : 
        data.paymentMethod === 'cod' ? 'pending' : 'paid';
      
      // Create shipping information object
      const shippingInfo = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city
      };
      
      // Create order data object
      const orderData = {
        items: cartItems,
        shipping: {
          info: shippingInfo,
          method: data.shippingMethod,
          price: shippingPrice,
          ...shippingMethods.find(method => method.id === data.shippingMethod)
        },
        payment: paymentDetails,
        orderType: data.paymentMethod,
        subtotal,
        discount: discountAmount,
        coupon: appliedCoupon,
        total,
        status: orderStatus,
        isGuestOrder: !isAuthenticated
      };
      
      // Create order in database
      const createdOrder = await createOrder(orderData);
      
      // Show success toast and redirect to success page
      toast({
        title: 'Order Submitted',
        description: data.paymentMethod === 'bkash' || data.paymentMethod === 'nagad' 
          ? 'Your order has been placed and is awaiting payment verification.' 
          : 'Your order has been placed successfully.',
        variant: 'success'
      });
      
      // Store payment method for success page to display appropriate message
      sessionStorage.setItem('payment_method', data.paymentMethod);
      
      // Also store the order ID for the success page
      if (createdOrder && createdOrder.order && createdOrder.order._id) {
        // Store the full order ID
        sessionStorage.setItem('last_order_id', createdOrder.order._id);
        
        // Also store the shortened format (ORD-XXXXXX)
        const shortId = 'ORD-' + createdOrder.order._id.slice(-6);
        sessionStorage.setItem('short_order_id', shortId);
      } else if (createdOrder && createdOrder._id) {
        // Store the full order ID
        sessionStorage.setItem('last_order_id', createdOrder._id);
        
        // Also store the shortened format (ORD-XXXXXX)
        const shortId = 'ORD-' + createdOrder._id.slice(-6);
        sessionStorage.setItem('short_order_id', shortId);
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
      
      toast({
        title: 'Order Submission Failed',
        description: error.message || 'There was an error processing your order. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (initializing || (cartItems.length === 0 && initializing)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Setting up checkout...</p>
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
              className={`w-full flex items-center justify-between transition-all duration-300 rounded-none ${showOrderSummary ? "border-primary shadow-md" : ""}`}
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
                <div className={`rounded-none p-1 transition-colors duration-300 ${showOrderSummary ? "" : "bg-muted"}`}>
                  {showOrderSummary ? (
                    <ChevronUp className="h-4 w-4 transition-transform duration-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 transition-transform duration-300" />
                  )}
                </div>
              </div>
            </Button>

            {/* Mobile Order Summary */}
            <div
              id="mobile-order-summary"
              className={`${showOrderSummary ? 'block' : 'hidden'} md:hidden mt-4 mb-6 transition-all duration-300`}
            >
              <OrderSummary 
                cartItems={cartItems}
                totalItems={totalItems}
                subtotal={subtotal}
                shippingPrice={shippingPrice}
                discountAmount={discountAmount}
                appliedCoupon={appliedCoupon}
                total={total}
                isMobile={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit(onSubmitOrder)} className="space-y-8">
                {/* Shipping Section Component */}
                <ShippingSection 
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  isAuthenticated={isAuthenticated}
                />

                {/* Payment Section Component */}
                <PaymentSection 
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  screenshotPreview={screenshotPreview}
                  setScreenshotPreview={setScreenshotPreview}
                />

                {/* Review Section Component */}
                <ReviewSection 
                  cartItems={cartItems}
                  totalItems={totalItems}
                  subtotal={subtotal}
                  shippingPrice={shippingPrice}
                  discountAmount={discountAmount}
                  totalProductDiscount={totalProductDiscount}
                  total={total}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  policyAccepted={policyAccepted}
                  isSubmitting={isSubmitting}
                  setShowTermsDialog={setShowTermsDialog}
                  setShowReturnPolicyDialog={setShowReturnPolicyDialog}
                  selectedShipping={selectedShipping}
                />
              </form>
            </div>

            {/* Order Summary - Desktop only */}
            <div className="hidden md:block">
              <div className="md:sticky md:top-20">
                <OrderSummary 
                  cartItems={cartItems}
                  totalItems={totalItems}
                  subtotal={subtotal}
                  shippingPrice={shippingPrice}
                  discountAmount={discountAmount}
                  appliedCoupon={appliedCoupon}
                  total={total}
                  isMobile={false}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Terms and Return Policy Dialogs */}
      <TermsDialog 
        showTermsDialog={showTermsDialog}
        setShowTermsDialog={setShowTermsDialog}
      />
      
      <ReturnPolicyDialog 
        showReturnPolicyDialog={showReturnPolicyDialog}
        setShowReturnPolicyDialog={setShowReturnPolicyDialog}
      />
    </div>
  );
} 