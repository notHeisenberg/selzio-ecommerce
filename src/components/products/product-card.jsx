"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { getProductUrl } from '@/data/products';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export function ProductCard({ product, index = 0, animationEnabled = true }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, addToWishlist, removeFromWishlist, refetchWishlist, wishlistItems } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const productUrl = getProductUrl(product);
  const [hoveredImage, setHoveredImage] = useState(0);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Get product ID consistently
  const getProductId = () => {
    return product?.productCode || product?.id || product?._id;
  };
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check wishlist status with refreshed data
  const checkWishlistStatus = async () => {
    try {
      if (!mounted || !product) return;
      
      const productId = getProductId();
      if (!productId) return;
      
      // Refetch wishlist data to get latest state
      await refetchWishlist();
      
      // Check if product is in wishlist
      const inWishlist = wishlistItems.some(item => 
        String(item.id) === String(productId) || 
        String(item.productCode) === String(productId)
      );
      
      // Update local state
      setIsWishlisted(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };
  
  // Initial check when component mounts
  useEffect(() => {
    if (mounted) {
      checkWishlistStatus();
    }
  }, [mounted, product?.id, product?.productCode]);
  
  // Re-check wishlist status when wishlistItems changes
  useEffect(() => {
    if (mounted) {
      const productId = getProductId();
      if (productId) {
        const inWishlist = wishlistItems.some(item => 
          String(item.id) === String(productId) || 
          String(item.productCode) === String(productId)
        );
        setIsWishlisted(inWishlist);
      }
    }
  }, [wishlistItems, mounted]);
  
  // Handle add to cart click
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = getProductId();
    
    if (!productId) {
      console.error("Cannot toggle wishlist: Missing product ID", product);
      toast({
        title: "Error",
        description: "Could not update wishlist. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Check wishlist status directly
    const productInWishlist = wishlistItems.some(item => 
      String(item.id) === String(productId) || 
      String(item.productCode) === String(productId)
    );
    
    // Optimistically update local state
    const newWishlistState = !productInWishlist;
    setIsWishlisted(newWishlistState);
    
    try {
      if (newWishlistState) {
        await addToWishlist(product);
      } else {
        await removeFromWishlist(productId);
      }
      
      await checkWishlistStatus();
    } catch (error) {
      // If error, revert optimistic update
      console.error("Error toggling wishlist:", error);
      setIsWishlisted(!newWishlistState);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
      
      await checkWishlistStatus();
    }
  };
  
  // Handle card click to navigate to product page
  const handleCardClick = () => {
    router.push(productUrl);
  };
  
  const handleMouseEnter = () => {
    if (Array.isArray(product.image) && product.image.length > 1) {
      setHoveredImage(1);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredImage(0);
  };
  
  // Calculate original price from discount
  const calculateOriginalPrice = () => {
    if (!product.discount || product.discount <= 0) return null;
    return (product.price * (100 / (100 - product.discount))).toFixed(2);
  };
  
  const originalPrice = calculateOriginalPrice();
  
  const cardContent = (
    <div className="card-wrapper cursor-pointer w-full h-full" onClick={handleCardClick}>
      <div className="card relative w-full bg-transparent dark:bg-transparent overflow-hidden">
        {/* Brand/Logo at top */}
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">SELZIO</span>
        </div>

        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-white dark:bg-neutral-800">
          {/* Product Image */}
          {Array.isArray(product.image) && product.image.length > 0 ? (
            <div className="relative w-full h-full" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <Image
                src={product.image[hoveredImage] || product.image[0]}
                alt={product.name}
                fill
                sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                className="object-contain transition-opacity duration-300"
                unoptimized={product.image[hoveredImage]?.includes('image1.jpg')}
                onError={(e) => {
                  console.error("Image failed to load:", product.image);
                  const parent = e.target.parentNode;
                  if (parent) {
                    const placeholderDiv = document.createElement('div');
                    placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                    placeholderDiv.innerHTML = `<span class="text-muted-foreground">${product.name || 'Product'}</span>`;
                    parent.replaceChild(placeholderDiv, e.target);
                  }
                }}
              />

              {/* Sale Badge - positioned inside the image container */}
              {product.discount > 0 && (
                <div className="absolute bottom-3 left-2 z-10">
                  <div className="bg-black text-white text-xs font-medium px-4 py-2 rounded-full">
                    -{product.discount}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <span className="text-muted-foreground">{product.name || 'Product'}</span>
            </div>
          )}
          
          {/* Hover action buttons */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-2 z-10">
            {/* Wishlist button */}
            <Button
              variant="secondary"
              size="icon"
              className={`rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg
                ${mounted && resolvedTheme === 'dark'
                  ? isWishlisted ? 'bg-red-900/70 hover:bg-red-800 border-red-700/30' : 'bg-gray-700/90 hover:bg-gray-600'
                  : isWishlisted ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' : 'bg-white/90 hover:bg-rose-50'
                }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-5 w-5 transition-colors duration-300
                ${mounted && resolvedTheme === 'dark'
                  ? isWishlisted ? 'fill-red-400 text-red-400' : 'text-gray-200 hover:text-red-400'
                  : isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-700 hover:text-rose-500'
                }`} />
            </Button>
            
            {/* Cart button */}
            <Button
              variant="secondary"
              size="icon"
              className={`rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg
                ${mounted && resolvedTheme === 'dark'
                  ? 'bg-gray-700/90 hover:bg-gray-600'
                  : 'bg-white/90 hover:bg-blue-50'
                }`}
              onClick={handleAddToCart}
            >
              <ShoppingCart className={`h-5 w-5 transition-colors duration-300
                ${mounted && resolvedTheme === 'dark'
                  ? 'text-gray-200 hover:text-blue-300'
                  : 'text-slate-700 hover:text-blue-600'
                }`} />
            </Button>
          </div>
        </div>
        
        {/* Product Info - Completely transparent background */}
        <div className="p-3 text-start mt-4 bg-transparent">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white group-hover:underline transition-all duration-200">
            {product.name}
          </h3>
          
          {/* Pricing */}
          <div className="mt-1 flex gap-2">
            {product.discount > 0 ? (
              <>
                <span className="text-gray-500 line-through text-sm">
                  Tk {originalPrice} BDT
                </span>
                <span className="text-neutral-900 dark:text-white font-medium text-sm">
                  Tk {product.price.toFixed(2)} BDT
                </span>
              </>
            ) : (
              <span className="text-neutral-900 dark:text-white font-medium text-sm">
                Tk {product.price.toFixed(2)} BDT
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Don't animate or apply theme styling during SSR
  if (!mounted) {
    return (
      <div className="h-full relative animate-pulse">
        <div className="absolute inset-0 bg-secondary/50"></div>
      </div>
    );
  }
  
  return animationEnabled ? (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-full relative"
    >
      {cardContent}
    </motion.div>
  ) : (
    <div className="group h-full relative">
      {cardContent}
    </div>
  );
} 