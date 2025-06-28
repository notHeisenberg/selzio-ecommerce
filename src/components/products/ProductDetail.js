"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import Link from 'next/link';
import { getProductByCode, getProductUrl, getRelatedProducts } from '@/data/products';

// Import our new components
import ProductImageGallery from './ProductImageGallery';
import ProductContentArea from './ProductContentArea';

export default function ProductDetail({ productCode }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with code:', productCode);
        const data = await getProductByCode(productCode);
        console.log('Product data received:', data);
        setProduct(data);
        
        // After fetching product, get related products
        fetchRelatedProducts(data?.productCode);
      } catch (err) {
        console.error('Failed to fetch product:', err);
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
  
  // Fetch related products
  const fetchRelatedProducts = async (code) => {
    if (!code) return;
    
    try {
      setLoadingRelated(true);
      console.log('Fetching related products for:', code);
      const relatedItems = await getRelatedProducts(code, 4);
      console.log('Related products received:', relatedItems);
      setRelatedProducts(relatedItems);
    } catch (err) {
      console.error('Failed to fetch related products:', err);
      // No need to show error to user for related products
      setRelatedProducts([]);
    } finally {
      setLoadingRelated(false);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
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
    <div className="container mx-auto px-4 py-8">
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
      
      {/* Related Products at the bottom */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        {/* The related products section stays in the main component */}
        {loadingRelated ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link 
                href={getProductUrl(relatedProduct)} 
                key={relatedProduct.productCode}
                className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative bg-card">
                  {/* Product Image */}
                  {Array.isArray(relatedProduct.image) && relatedProduct.image.length > 0 ? (
                    <Image
                      src={relatedProduct.image[0]}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={relatedProduct.image[0]?.includes('image1.jpg')}
                      onError={(e) => {
                        console.error("Image failed to load:", relatedProduct.image);
                        const parent = e.target.parentNode;
                        if (parent) {
                          // Create replacement div
                          const placeholderDiv = document.createElement('div');
                          placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                          placeholderDiv.innerHTML = `<span class="text-muted-foreground">${relatedProduct.name || 'Product'}</span>`;
                          
                          // Replace the img with the div
                          parent.replaceChild(placeholderDiv, e.target);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                      <span className="text-muted-foreground">{relatedProduct.name || 'Product'}</span>
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Discount badge if applicable */}
                  {relatedProduct.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
                      {relatedProduct.discount}% OFF
                    </div>
                  )}
                  
                  {/* Top selling badge if applicable */}
                  {relatedProduct.topSelling && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      Top Selling
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{relatedProduct.name}</h3>
                  
                  {/* Price display */}
                  <div className="flex items-center mt-1">
                    {relatedProduct.discount > 0 ? (
                      <>
                        <p className="text-primary font-semibold text-sm">
                          {formatPrice(getDiscountedPrice(relatedProduct.price, relatedProduct.discount))}
                        </p>
                        <p className="text-muted-foreground line-through ml-2 text-xs">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </>
                    ) : (
                      <p className="text-primary font-semibold text-sm">{formatPrice(relatedProduct.price)}</p>
                    )}
                  </div>
                  
                  {/* Simple rating display */}
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      {relatedProduct.rating} ({relatedProduct.reviews})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-secondary/10">
            <p className="text-muted-foreground">No related products found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 