"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import Link from 'next/link';
import { getProductByCode } from '@/data/products';

import ProductImageGallery from './ProductImageGallery';
import ProductContentArea from './ProductContentArea';
import RelatedProducts from './sections/RelatedProducts';

export default function ProductDetail({ productCode }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductByCode(productCode);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productCode) {
      fetchProduct();
    } else {
      console.error('No productCode provided to ProductDetail component');
    }
  }, [productCode]);

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = (productToAdd, qty = quantity) => {
    if (productToAdd) {
      // Use the passed product object which may include selected size
      const success = addToCart(productToAdd, qty);
      if (success && !productToAdd.selectedSize) {
        // Only show toast if not showing from ProductContentArea (which has its own toast)
        toast({
          title: "Added to Cart",
          description: `${productToAdd.name} has been added to your cart.`,
        });
      }
    }
  };

  // Handle buy now
  const handleBuyNow = (productToAdd, qty = quantity) => {
    if (productToAdd) {
      // Use the passed product object which may include selected size
      addToCart(productToAdd, qty);
      // Redirect to checkout page
      window.location.href = '/checkout';
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product);
    }
  };

  // Calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  // Format price with BDT
  const formatPrice = (price) => {
    return `${price.toFixed(2)} BDT`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image skeleton */}
          <div className="md:w-1/2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="md:w-1/2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Product</h2>
        <p className="text-muted-foreground mb-8">{error}</p>
        <Link href="/store">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Store
          </Button>
        </Link>
      </div>
    );
  }

  // If no product found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">Sorry, the product with code &quot;{productCode}&quot; doesn&apos;t exist or has been removed.</p>
        
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-8 inline-block text-left">
          <h3 className="font-semibold mb-2">Developer Information</h3>
          <p className="text-sm mb-2">No product found with code: {productCode}</p>
          <p className="text-sm">If this is unexpected, please check:</p>
          <ul className="text-sm list-disc pl-5 mt-2">
            <li>That the product exists in your MongoDB database</li>
            <li>That the product code matches exactly (case-sensitive)</li>
            <li>That the API route is correctly handling the request</li>
            <li>Check browser console for any error messages</li>
          </ul>
        </div>
        
        <div>
          <Link href="/store">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:max-w-[1200px]">
      {/* Main product section with separate components */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Images - Sticky */}
        <ProductImageGallery product={product} />
        
        {/* Product Content - Scrollable */}
        <ProductContentArea 
          product={product}
          quantity={quantity}
          handleQuantityChange={handleQuantityChange}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          isInWishlist={isInWishlist}
          handleWishlistToggle={handleWishlistToggle}
          formatPrice={formatPrice}
          getDiscountedPrice={getDiscountedPrice}
        />
      </div>
      
      {/* Related Products section - now using separate component */}
      <RelatedProducts productCode={product.productCode} limit={4} />
    </div>
  );
} 