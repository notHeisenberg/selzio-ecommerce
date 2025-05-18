"use client"

import { useEffect, useRef } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Toast, 
  ToastTitle, 
  ToastDescription, 
  ToastAction 
} from '@/components/ui/toast';
import gsap from 'gsap';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const AddToCartToast = ({ 
  open, 
  onOpenChange, 
  product,
  quantity,
  onViewCart
}) => {
  const toastRef = useRef(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (open && toastRef.current) {
      // Animate the toast in with a small bounce effect
      gsap.fromTo(
        toastRef.current,
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.4, 
          ease: "back.out(1.7)" 
        }
      );
    }
  }, [open]);

  const handleViewCart = () => {
    // First dismiss the toast
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    // Navigate to cart page
    router.push('/cart');
  };

  if (!product) return null;

  return (
    <Toast
      ref={toastRef}
      open={open}
      onOpenChange={onOpenChange}
      variant="success"
    >
      <div className="flex items-start gap-2">
        <div className={`rounded-full p-1 ${
          isDark 
            ? 'bg-green-900/30 text-green-300'
            : 'bg-green-100 text-green-600'
        }`}>
          <Check className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <ToastTitle className={isDark ? 'text-gray-100' : 'text-gray-900'}>Added to Cart</ToastTitle>
          <ToastDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {quantity > 1 ? `${quantity} x ` : ""}{product.name}
          </ToastDescription>
        </div>
      </div>
      
      <div className="mt-2 flex flex-col gap-2">
        <ToastAction asChild altText="Quick view cart drawer">
          <Button 
            variant="outline" 
            size="sm"
            className={`w-full transition-colors ${
              isDark 
                ? 'border-green-900/40 text-green-300 hover:bg-green-900/30 hover:text-green-300 hover:border-green-800/70'
                : 'border-green-200 hover:bg-green-100 hover:text-green-800'
            }`}
            onClick={onViewCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Quick View
          </Button>
        </ToastAction>
        
        <Button 
          variant="secondary" 
          size="sm"
          className={`w-full transition-colors font-medium ${
            isDark 
              ? 'bg-green-700/40 text-green-100 hover:bg-green-700/60 hover:text-white border border-green-800/70'
              : 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200'
          }`}
          onClick={handleViewCart}
        >
          Go to Cart
        </Button>
      </div>
    </Toast>
  );
};

export default AddToCartToast; 