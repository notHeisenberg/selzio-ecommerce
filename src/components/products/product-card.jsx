"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { getProductUrl } from '@/data/products';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ProductCard({ product, index = 0, animationEnabled = true }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, addToWishlist, removeFromWishlist, loadWishlist, wishlistItems } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();
  const productUrl = getProductUrl(product);
  const [hoveredImage, setHoveredImage] = useState(0);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false);
  const popoverTriggerRef = useRef(null);

  // Get product ID consistently
  const getProductId = () => {
    return product?.productCode || product?.id || product?._id;
  };

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Initialize selected size if product has sizes
    if (product?.sizes?.length > 0) {
      // Find first in-stock size
      const firstInStockSize = product.sizes.find(size => size.stock > 0);
      if (firstInStockSize) {
        setSelectedSize(firstInStockSize.name);
      } else {
        setSelectedSize(product.sizes[0].name);
      }
    }
  }, [product]);

  // Check wishlist status with refreshed data
  const checkWishlistStatus = async () => {
    try {
      if (!mounted || !product) return;

      const productId = getProductId();
      if (!productId) return;

      // Refetch wishlist data to get latest state
      await loadWishlist();

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
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Check if product has sizes
    if (product.sizes && product.sizes.length > 0) {
      // Open the popover for size selection
      setSizePopoverOpen(true);
      return;
    }

    // If no sizes, add directly to cart
    addToCart(product);

    // Show success toast
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      variant: "success"
    });
  };

  // Handle adding to cart with selected size
  const addToCartWithSize = () => {
    // Check if size is selected
    if (!selectedSize) {
      toast({
        title: "Please Select a Size",
        description: "You must select a size before adding to cart.",
        variant: "destructive"
      });
      return;
    }

    // Check if selected size is in stock
    const sizeInfo = product.sizes.find(s => s.name === selectedSize);
    if (sizeInfo && sizeInfo.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `Size ${selectedSize} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    // Create product with selected size
    const sizePrice = sizeInfo?.price || product.price;
    const productWithSize = {
      ...product,
      selectedSize,
      price: sizePrice
    };

    // Add to cart and close popover
    addToCart(productWithSize);
    setSizePopoverOpen(false);

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
                className="object-cover transition-opacity duration-300"
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
                  <div className="bg-black/70 text-white text-xs font-medium px-3 py-1.5 shadow-sm">
                    -{product.discount}% OFF
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
              <span className="text-muted-foreground">{product.name || 'Product'}</span>
            </div>
          )}

          {/* Action buttons - Hidden by default, visible on hover */}
          <div className="absolute top-3 right-3 flex gap-1.5 sm:gap-2 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100">
            {/* Wishlist button */}
            <Button
              variant="ghost"
              size="sm"
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 p-0 rounded-md transition-all duration-300 hover:scale-105 group/btn
                ${mounted && resolvedTheme === 'dark'
                  ? isWishlisted
                    ? 'bg-red-500/20 text-red-400 hover:bg-transparent hover:border-2 hover:border-red-500'
                    : 'bg-gray-800/60 text-white hover:bg-transparent hover:border-2 hover:border-red-500'
                  : isWishlisted
                    ? 'bg-rose-50 text-rose-500 hover:bg-transparent hover:border-2 hover:border-rose-500'
                    : 'bg-white/80 text-slate-700 hover:bg-transparent hover:border-2 hover:border-rose-500'
                }`}
              onClick={handleWishlistToggle}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-colors duration-300
                ${mounted && resolvedTheme === 'dark'
                  ? isWishlisted 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-200 group-hover/btn:text-red-500 group-hover/btn:fill-red-500/30'
                  : isWishlisted 
                    ? 'fill-rose-500 text-rose-500' 
                    : 'text-slate-700 group-hover/btn:text-rose-500 group-hover/btn:fill-rose-500/30'
                }`} />
            </Button>

            {/* Cart button with popover for size selection */}
            <Popover open={sizePopoverOpen && product.sizes?.length > 0} onOpenChange={setSizePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  ref={popoverTriggerRef}
                  variant="ghost"
                  size="sm"
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 p-0 rounded-md transition-all duration-300 hover:scale-105 group/cart
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-gray-800/60 text-white hover:bg-transparent hover:border-2 hover:border-white'
                      : 'bg-white/80 text-slate-700 hover:bg-transparent hover:border-2 hover:border-black'
                    }`}
                  onClick={handleAddToCart}
                  title={product.sizes && product.sizes.length > 0 ? "Select Size & Add to Cart" : "Add to Cart"}
                >
                  <ShoppingCart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 transition-colors duration-300
                    ${mounted && resolvedTheme === 'dark'
                      ? 'text-gray-200 group-hover/cart:text-white'
                      : 'text-slate-700 group-hover/cart:text-black'
                    }`} />
                </Button>
              </PopoverTrigger>

              {product.sizes && product.sizes.length > 0 && (
                <PopoverContent className="w-64 p-0 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}>
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div>
                      <h4 className="font-semibold">Select a Size</h4>
                      <p className="text-xs text-muted-foreground">Please select a size to continue</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setSizePopoverOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-4 grid grid-cols-3 gap-2 bg-white dark:bg-gray-900">
                    {product.sizes.map((size) => {
                      const isOutOfStock = size.stock <= 0;
                      return (
                        <motion.button
                          key={size.name}
                          onClick={() => !isOutOfStock && setSelectedSize(size.name)}
                          disabled={isOutOfStock}
                          whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                          whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                          className={`px-2 py-3 relative flex items-center justify-center rounded-md transition-all duration-200
                            ${selectedSize === size.name
                              ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                              : isOutOfStock
                                ? 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                                : 'bg-gray-50 text-black hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                            }`}
                        >
                          <span className={isOutOfStock ? 'line-through' : ''}>
                            {size.name}
                          </span>
                          {selectedSize === size.name && !isOutOfStock && (
                            <div className="absolute top-1 right-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <Button
                      className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-md transition-all duration-300"
                      onClick={addToCartWithSize}
                      disabled={!selectedSize || product.sizes.find(s => s.name === selectedSize)?.stock <= 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>
        </div>

        {/* Product Info - Completely transparent background */}
        <div className="p-3 text-start mt-4 bg-transparent">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white group-hover:underline transition-all duration-200">
            {product.name}
          </h3>

          <div className="flex justify-between gap-2">
            {/* Price information */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium">
                {product.price ? `Tk ${product.price}` : 'Price not available'}
              </span>

              {originalPrice && (
                <span className="text-xs line-through text-neutral-500 dark:text-neutral-400">
                  Tk {originalPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {product.rating} {product.reviewCount && `(${product.reviewCount})`}
                </span>
              </div>
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