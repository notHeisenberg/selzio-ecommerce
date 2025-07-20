"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductUrl } from '@/data/products';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

// Safe function to get product URL with fallback
const safeGetProductUrl = (item) => {
  try {
    return getProductUrl(item);
  } catch (error) {
    console.error("Error generating product URL:", error, item);
    // Fallback URL using just the product ID
    return `/product/${item.id}`;
  }
};

// Helper to validate image URL
const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // For arrays of URLs, check if there's at least one valid URL
  if (Array.isArray(url)) {
    return url.length > 0 && url.some(u => isValidImageUrl(u));
  }
  
  // Check if it's a valid URL format
  if (!/^(\/|https?:\/\/)/.test(url)) return false;
  
  // If it's a relative URL, make sure it's properly formatted
  if (url.startsWith('/')) {
    // Check that it's a valid path with an image extension or a dynamic image route
    return /\.(jpg|jpeg|png|gif|webp|svg)$/.test(url) || url.includes('/api/image');
  }
  
  // For external URLs
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper to get the primary image from a product
const getPrimaryImage = (item) => {
  if (!item.image) return null;
  
  if (Array.isArray(item.image) && item.image.length > 0) {
    return item.image[0];
  }
  
  return item.image; // For backward compatibility
};

export default function WishlistTab() {
  const [mounted, setMounted] = useState(false);
  const [forceLoaded, setForceLoaded] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { wishlistItems, removeFromWishlist, totalItems, isLoading, loadWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [error, setError] = useState(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Force exit loading state after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
          
        setForceLoaded(true);
      }
    }, 1000); // 10 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Load wishlist data when component mounts
  useEffect(() => {
    if (mounted) {
      try {
        loadWishlist().catch(err => {
          console.error("Error loading wishlist:", err);
          setError("Failed to load wishlist");
        });
      } catch (err) {
        console.error("Error in loadWishlist call:", err);
        setError("Failed to load wishlist");
      }
    }
  }, [mounted, loadWishlist]);

  // Add debug logging for wishlist items
  useEffect(() => {
    if (mounted) {
      
      if (isLoading) {
        
      } else {
        
        // Check for issues with wishlist items
        if (wishlistItems && wishlistItems.length > 0) {
          wishlistItems.forEach((item, index) => {
            
          });
        } else if (totalItems > 0) {
          console.warn("Total items > 0 but no wishlist items found");
        }
      }
    }
  }, [wishlistItems, isLoading, mounted, totalItems, forceLoaded, error]);

  // Handle move to cart
  const handleMoveToCart = async (product) => {
    try {
      // Make sure we have a valid product
      if (!product || !product.id) {
        console.error("Invalid product passed to handleMoveToCart:", product);
        toast({
          title: "Error",
          description: "Cannot add invalid product to cart.",
          variant: "destructive" 
        });
        return;
      }

      // Convert ID to string for consistency
      const stringProductId = String(product.id);
      
      
      // First add to cart
      addToCart(product);
      
      // Then remove from wishlist and wait for it to complete
      try {
        await removeFromWishlist(stringProductId);
        
        // Show success toast
        const { dismiss } = toast({
          title: "Removed from Wishlist",
          description: `${product.name} has been removed from your wishlist.`,
          variant: "wishlist",
          action: (
            <div className="mt-2 w-full">
              <button 
                className="w-full flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 dark:focus:ring-rose-500 dark:focus:ring-offset-gray-800 focus:ring-offset-white
                  dark:border-rose-800/50 dark:text-rose-300 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:hover:text-rose-200
                  border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800"
                onClick={() => {
                  dismiss();
                  document.dispatchEvent(new CustomEvent('open-cart-drawer'));
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Cart
              </button>
            </div>
          ),
        });
        
        // Immediately refetch to update UI
        loadWishlist();
      } catch (removeError) {
        console.error("Error removing item from wishlist:", removeError);
        // Still show success for cart addition but warn about wishlist
        toast({
          title: "Added to Cart",
          description: `${product.name} added to cart but couldn't be removed from wishlist.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error moving item to cart:", error);
      let errorMessage = "Failed to move item to cart. Please try again.";
      
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}. Please try again.`;
      } else if (error.request) {
        errorMessage = 'Network error. Check your connection and try again.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (itemId, itemName) => {
    try {
      // Validate input
      if (!itemId) {
        console.error("Invalid itemId passed to handleRemoveFromWishlist");
        return;
      }

      // Convert to string for consistency
      const stringItemId = String(itemId);
      
      
      // Remove from wishlist and wait for completion
      await removeFromWishlist(stringItemId);
      
      // Immediately refetch to update UI
      loadWishlist();

    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      let errorMessage = "Failed to remove item from wishlist. Please try again.";
      
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}. Please try again.`;
      } else if (error.request) {
        errorMessage = 'Network error. Check your connection and try again.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>
          {totalItems > 0 
            ? `You have ${totalItems} ${totalItems === 1 ? 'item' : 'items'} in your wishlist`
            : "Products you've saved for later"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error state */}
        {error && (
          <div className="text-center py-6">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <span className="text-red-500 dark:text-red-400 text-3xl">!</span>
            </div>
            <h2 className="text-xl font-semibold mb-3">Something went wrong</h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                loadWishlist();
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {/* Wishlist loading state */}
        {!error && isLoading && !forceLoaded && (
          <div className="space-y-6">
            <div className="h-4 w-1/3 bg-secondary/50 animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="rounded-xl overflow-hidden border">
                  <div className="h-[160px] bg-secondary/50 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-secondary/50 animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-secondary/50 animate-pulse rounded w-1/2"></div>
                    <div className="h-4 bg-secondary/50 animate-pulse rounded w-1/4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-secondary/50 animate-pulse rounded w-1/4"></div>
                      <div className="h-6 bg-secondary/50 animate-pulse rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Manual override for stuck loading state */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-2">Taking too long?</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setForceLoaded(true)}
              >
                Show Wishlist Anyway
              </Button>
            </div>
          </div>
        )}
        
        {/* Wishlist items or empty state */}
        {!error && (!isLoading || forceLoaded) && (
          <>
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && wishlistItems.length > 0 && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                <details>
                  <summary className="cursor-pointer font-medium">Debug: Wishlist Raw Data ({wishlistItems.length} items)</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-white dark:bg-gray-900 rounded">
                    {JSON.stringify(wishlistItems, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          
            {wishlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlistItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`overflow-hidden ${mounted && resolvedTheme === 'dark' ? 'border-gray-800' : ''}`}
                  >
                    <CardContent className="p-0">
                      {/* Product Image with Badge */}
                      <div className="relative">
                        <div 
                          className="relative aspect-video cursor-pointer"
                          onClick={() => router.push(safeGetProductUrl(item))}
                        >
                          {(item.image && isValidImageUrl(item.image)) ? (
                            <Image
                              src={getPrimaryImage(item)}
                              alt={item.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.error("Image failed to load:", item.image);
                                // Replace with a div instead of trying to set src
                                const parent = e.target.parentNode;
                                if (parent) {
                                  // Create replacement div
                                  const placeholderDiv = document.createElement('div');
                                  placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                                  placeholderDiv.innerHTML = `<span class="text-muted-foreground">${item.name || 'Product'}</span>`;
                                  
                                  // Replace the img with the div
                                  parent.replaceChild(placeholderDiv, e.target);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                              <span className="text-muted-foreground">{item.name || 'Product'}</span>
                            </div>
                          )}
                          
                          {/* Discount Badge */}
                          {item.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">
                              {item.discount}% OFF
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute bottom-0 right-0 flex p-2 gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className={`rounded-full shadow-lg hover:scale-110 transition-transform
                              ${mounted && resolvedTheme === 'dark'
                                ? 'bg-gray-800/90 hover:bg-gray-700 text-gray-200'
                                : 'bg-white/90 hover:bg-white text-rose-500'
                              }`}
                            onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="secondary"
                            size="icon"
                            className={`rounded-full shadow-lg hover:scale-110 transition-transform
                              ${mounted && resolvedTheme === 'dark'
                                ? 'bg-blue-600/90 hover:bg-blue-700 text-white'
                                : 'bg-primary/90 hover:bg-primary text-white'
                              }`}
                            onClick={() => handleMoveToCart(item)}
                            title="Add to cart"
                            disabled={!item.inStock}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Product Name */}
                        <h3 
                          className="font-medium text-lg mb-1 hover:text-primary cursor-pointer line-clamp-2"
                          onClick={() => router.push(safeGetProductUrl(item))}
                        >
                          {item.name}
                        </h3>
                        
                        {/* Rating display */}
                        {item.rating > 0 && (
                          <div className="flex items-center mt-1 mb-2">
                            <div className="flex text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                  {i < Math.floor(item.rating) ? (
                                    <span>★</span>
                                  ) : i < Math.floor(item.rating) + 0.5 ? (
                                    <span>⭐</span>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">☆</span>
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.rating.toFixed(1)})
                            </span>
                          </div>
                        )}
                        
                        {/* Price with discount display */}
                        <div className="flex items-center mt-2">
                          {item.discount > 0 ? (
                            <>
                              <p className="text-primary font-semibold">
                                {(item.price * (1 - item.discount / 100)).toFixed(2)} BDT
                              </p>
                              <p className="text-muted-foreground line-through ml-2 text-sm">
                                {item.price.toFixed(2)} BDT
                              </p>
                            </>
                          ) : (
                            <p className="text-primary font-semibold">{item.price.toFixed(2)} BDT</p>
                          )}
                        </div>
                        
                        {/* Stock status */}
                        <div className="mt-3">
                          {item.inStock ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                              In Stock ({item.stock} available)
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        
                        {/* Category and Added Date */}
                        <div className="flex flex-wrap justify-between items-center mt-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                              {item.category}
                            </span>
                            {item.subcategory && (
                              <span className="text-xs px-2 py-1 bg-secondary/60 rounded-full">
                                {item.subcategory}
                              </span>
                            )}
                          </div>
                          
                          {/* Added to wishlist date */}
                          <div className="text-xs text-muted-foreground mt-2">
                            Added {new Date(item.addedToWishlistAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* View Item Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="group w-full mt-4 border-primary/20 hover:bg-primary/5 hover:border-primary"
                          onClick={() => router.push(safeGetProductUrl(item))}
                        >
                          View Details
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="rounded-full bg-secondary/30 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-primary/60" />
                </div>
                <h2 className="text-xl font-semibold mb-3">Your wishlist is empty</h2>
                <p className="text-muted-foreground mb-8">
                  Save items you like by clicking the heart icon on product cards
                </p>
                <Button 
                  onClick={() => router.push('/store')}
                  className={`group shadow-md
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : ''
                    }`}
                >
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 