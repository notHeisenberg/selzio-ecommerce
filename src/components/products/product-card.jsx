"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
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
      
      // Check if product is in wishlist by using the consistent ID from the product
      // Convert IDs to strings for consistent comparison
      const inWishlist = wishlistItems.some(item => 
        String(item.id) === String(productId) || 
        String(item.productCode) === String(productId)
      );
      
      console.log(`[WISHLIST CHECK] Product ${productId} (${product.name}) in wishlist: ${inWishlist}`);
      
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
        // Use direct comparison with wishlistItems instead of isInWishlist function
        // since the function might be using a different ID format
        const inWishlist = wishlistItems.some(item => 
          String(item.id) === String(productId) || 
          String(item.productCode) === String(productId)
        );
        setIsWishlisted(inWishlist);
      }
    }
  }, [wishlistItems, mounted]);
  
  // Periodic refresh of wishlist status (every 5 seconds)
  useEffect(() => {
    if (!mounted) return;
    
    const intervalId = setInterval(() => {
      checkWishlistStatus();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [mounted]);
  
  // Handle add to cart click
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation(); // Prevent event bubbling
    
    // Add product to cart
    addToCart(product);
    
    // The toast is now handled in the useCart hook
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigating to product page
    e.stopPropagation(); // Prevent event bubbling
    
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
    
    // Check wishlist status directly with our consistent comparison
    const productInWishlist = wishlistItems.some(item => 
      String(item.id) === String(productId) || 
      String(item.productCode) === String(productId)
    );
    
    console.log(`Toggling wishlist for product ${productId} (${product.name}), current state: ${productInWishlist}`);
    
    // Optimistically update local state for immediate feedback
    const newWishlistState = !productInWishlist;
    setIsWishlisted(newWishlistState);
    
    try {
      if (newWishlistState) {
        // Add to wishlist - toast is already handled in the useWishlist hook
        await addToWishlist(product);
      } else {
        // Remove from wishlist - toast is already handled in the useWishlist hook
        await removeFromWishlist(productId);
      }
      
      // Immediately refresh wishlist data
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
      
      // Still try to refresh wishlist data
      await checkWishlistStatus();
    }
  };
  
  // Handle card click to navigate to product page
  const handleCardClick = () => {
    router.push(productUrl);
  };
  
  const cardContent = (
    <>
      {/* Background gradient effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-90 transition-opacity duration-500 group-hover:opacity-100
        ${mounted && resolvedTheme === 'dark' 
          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900/80' 
          : 'bg-gradient-to-br from-white via-white to-slate-100'
        }`}
      ></div>

      {/* Glass morphism card */}
      <div 
        onClick={handleCardClick}
        className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 
          ${mounted && resolvedTheme === 'dark'
            ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 shadow-[0_8px_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.3)] group-hover:border-gray-600/70 group-hover:bg-gray-800/95'
            : 'bg-white/90 backdrop-blur-sm border border-slate-100/60 shadow-[0_8px_20px_rgb(100,116,139,0.07)] group-hover:shadow-[0_15px_35px_rgb(100,116,139,0.1)] group-hover:border-slate-200/80 group-hover:bg-white/95'
          }
          group-hover:translate-y-[-5px]
          cursor-pointer`}>

        {/* Decorative elements */}
        <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-xl 
          transition-all duration-700 ease-in-out group-hover:scale-150 group-hover:rotate-45 
          ${mounted && resolvedTheme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/10 to-blue-400/5 group-hover:from-blue-500/20 group-hover:to-blue-400/10'
            : 'bg-gradient-to-br from-slate-200/30 to-slate-100/40 group-hover:from-slate-200/40 group-hover:to-slate-100/50'
          }`}></div>

        {/* Product Image */}
        <div className="relative aspect-square z-10 overflow-hidden">
          {Array.isArray(product.image) && product.image.length > 0 ? (
            <Image
              src={product.image[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized={product.image[0]?.includes('image1.jpg')} // Skip optimization for test images
              onError={(e) => {
                console.error("Image failed to load:", product.image);
                const parent = e.target.parentNode;
                if (parent) {
                  // Create replacement div
                  const placeholderDiv = document.createElement('div');
                  placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                  placeholderDiv.innerHTML = `<span class="text-muted-foreground">${product.name || 'Product'}</span>`;
                  
                  // Replace the img with the div
                  parent.replaceChild(placeholderDiv, e.target);
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <span className="text-muted-foreground">{product.name || 'Product'}</span>
            </div>
          )}
          {product.discount > 0 && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium shadow-sm
              ${mounted && resolvedTheme === 'dark'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'
              }`}>
              -{product.discount}%
            </div>
          )}
          <div 
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 transition-all duration-300 flex gap-2"
          >
            {/* Wishlist button */}
            <Button
              variant="secondary"
              size="icon"
              className={`rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg
                ${mounted && resolvedTheme === 'dark'
                  ? isWishlisted ? 'bg-red-900/70 hover:bg-red-800 border-red-700/30' : 'bg-gray-700/90 hover:bg-gray-600 hover:border-gray-500'
                  : isWishlisted ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' : 'bg-white/90 hover:bg-rose-50 hover:border-rose-200'
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
                  ? 'bg-gray-700/90 hover:bg-gray-600 hover:border-gray-500'
                  : 'bg-white/90 hover:bg-violet-50 hover:border-violet-200'
                }`}
              onClick={handleAddToCart}
            >
              <ShoppingCart className={`h-5 w-5 transition-colors duration-300
                ${mounted && resolvedTheme === 'dark'
                  ? 'text-gray-200 hover:text-blue-300'
                  : 'text-slate-700 hover:text-violet-700'
                }`} />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm px-3 py-1 rounded-full
              ${mounted && resolvedTheme === 'dark'
                ? 'bg-gray-700/80 text-gray-200'
                : 'bg-white/80 text-slate-700'
              }`}>
              {product.category}
              {product.subcategory && <span> &middot; {product.subcategory}</span>}
            </span>
            <div className="flex items-center">
              <Star className={`h-4 w-4 
                ${mounted && resolvedTheme === 'dark'
                  ? 'fill-blue-400 text-blue-400'
                  : 'fill-amber-400 text-amber-400'
                }`} />
              <span className={`ml-1 text-sm 
                ${mounted && resolvedTheme === 'dark'
                  ? 'text-gray-200'
                  : 'text-slate-700'
                }`}>{product.rating}</span>
              <span className={`ml-1 text-sm 
                ${mounted && resolvedTheme === 'dark'
                  ? 'text-gray-400'
                  : 'text-slate-500'
                }`}>({product.reviews})</span>
            </div>
          </div>

          <div className="block mb-2">
            <h3 className={`text-lg font-semibold transition-colors duration-300
              ${mounted && resolvedTheme === 'dark'
                ? 'text-gray-100 group-hover:text-blue-300'
                : 'text-slate-800 group-hover:text-violet-700'
              }`}>
              {product.name}
            </h3>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold 
                  ${mounted && resolvedTheme === 'dark'
                    ? 'text-gray-100'
                    : 'text-slate-800'
                  }`}>
                  {product.price.toFixed(2)} BDT
                </span>
                {product.discount > 0 && (
                  <span className={`text-sm line-through 
                    ${mounted && resolvedTheme === 'dark'
                      ? 'text-gray-500'
                      : 'text-slate-500'
                    }`}>
                    {(product.price * (1 + product.discount / 100)).toFixed(2)} BDT
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm font-medium 
                transition-all duration-300 group-hover:translate-x-0 
                opacity-100 group-hover:opacity-100">
                <span className={`mr-1 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300
                  ${mounted && resolvedTheme === 'dark'
                    ? 'text-gray-300'
                    : 'text-slate-700'
                  }`}>
                  View
                </span>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full shadow-sm 
                  transition-all duration-300 group-hover:scale-110
                  ${mounted && resolvedTheme === 'dark'
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 group-hover:bg-blue-900 group-hover:text-blue-300'
                    : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 group-hover:bg-violet-100 group-hover:text-violet-600'
                  }`}>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
            
            {/* Stock indicator */}
            <div className="mt-2">
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                product.stock > 10 
                  ? mounted && resolvedTheme === 'dark' ? 'bg-green-900/40 text-green-300' : 'bg-green-50 text-green-700'
                  : product.stock > 0 
                    ? mounted && resolvedTheme === 'dark' ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-700' 
                    : mounted && resolvedTheme === 'dark' ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-700'
              }`}>
                {product.stock > 10 
                  ? 'In Stock' 
                  : product.stock > 0 
                    ? `Low Stock (${product.stock})` 
                    : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  
  // Don't animate or apply theme styling during SSR
  if (!mounted) {
    return (
      <div className="group h-full relative animate-pulse">
        <div className="absolute inset-0 bg-secondary/50 rounded-2xl"></div>
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