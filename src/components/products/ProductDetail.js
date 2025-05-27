"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Truck, ShoppingCart, Heart, Clock, ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import Link from 'next/link';
import { getProductByCode, getProductUrl, getRelatedProducts } from '@/data/products';

export default function ProductDetail({ productCode }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
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
    // Create a fallback product for debugging purposes
    console.log('No product found with code:', productCode);
    
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

  // Generate product images for gallery
  const productImages = Array.isArray(product.image) ? product.image : [product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="md:w-1/2">
          {/* Main Image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-card shadow-sm">
            {productImages.length > 0 ? (
              <Image
                src={productImages[selectedImage] || ''}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized={productImages[selectedImage]?.includes('image1.jpg')} // Skip optimization for test images
                onError={(e) => {
                  console.error("Image failed to load:", productImages[selectedImage]);
                  // Create and replace with placeholder div
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
              <div className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                -{product.discount}%
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {productImages.map((image, index) => (
              <button
                key={index}
                className={`relative aspect-square rounded-md overflow-hidden ${
                  selectedImage === index ? 'ring-2 ring-primary' : 'ring-1 ring-border'
                }`}
                onClick={() => setSelectedImage(index)}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`Product view ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={image?.includes('image1.jpg')} // Skip optimization for test images
                    onError={(e) => {
                      // Create and replace with placeholder div
                      const parent = e.target.parentNode;
                      if (parent) {
                        // Create replacement div
                        const placeholderDiv = document.createElement('div');
                        placeholderDiv.className = "w-full h-full bg-secondary/30 flex items-center justify-center";
                        placeholderDiv.innerHTML = `<span class="text-xs text-muted-foreground">Image ${index+1}</span>`;
                        
                        // Replace the img with the div
                        parent.replaceChild(placeholderDiv, e.target);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Image {index+1}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Product code */}
          <p className="text-sm text-muted-foreground mb-4">Product Code: {product.productCode}</p>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
          
          {/* Price */}
          <div className="mb-6">
            {product.discount > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(getDiscountedPrice(product.price, product.discount))}
                </span>
                <span className="text-lg line-through text-muted-foreground">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="outline" className="bg-red-50 text-red-700 ml-2">Save {product.discount}%</Badge>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="flex items-center mb-6">
            {product.stock > 10 ? (
              <div className="flex items-center text-green-600">
                <Check className="h-4 w-4 mr-2" />
                <span>In Stock</span>
              </div>
            ) : product.stock > 0 ? (
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Low Stock - Only {product.stock} left</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Out of Stock</span>
              </div>
            )}
          </div>
          
          {/* Short Description */}
          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>
          
          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="text-sm font-medium mr-4">Quantity:</span>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-r-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <div className="h-9 w-12 flex items-center justify-center border-y border-border">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-l-none"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock || product.stock === 0}
              >
                +
              </Button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <Button
              className="flex items-center justify-center"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            
            <Button
              variant={isInWishlist(product.productCode) ? "default" : "outline"}
              className={isInWishlist(product.productCode) ? "bg-rose-600 hover:bg-rose-700" : ""}
              onClick={handleWishlistToggle}
            >
              <Heart className={`mr-2 h-4 w-4 ${isInWishlist(product.productCode) ? "fill-white text-white" : ""}`} />
              {isInWishlist(product.productCode) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>
          
          {/* Shipping Info */}
          <div className="flex items-center p-4 bg-secondary/50 rounded-lg mb-6">
            <Truck className="h-5 w-5 mr-3 text-primary" />
            <div>
              <p className="text-sm font-medium">Free Shipping</p>
              <p className="text-xs text-muted-foreground">On orders over 2000 BDT</p>
            </div>
          </div>
          
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <span className="text-sm font-medium mr-2">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="description" className="space-y-4">
              <h3 className="text-xl font-semibold">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This premium product delivers exceptional quality and performance. Made with high-quality materials
                and attention to detail, it&apos;s designed to exceed your expectations and provide lasting value.
              </p>
            </TabsContent>
            
            <TabsContent value="specifications" className="space-y-4">
              <h3 className="text-xl font-semibold">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Brand</div>
                    <div className="p-3">Selzio</div>
                  </div>
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Category</div>
                    <div className="p-3">{product.category}</div>
                  </div>
                  {product.subcategory && (
                    <div className="grid grid-cols-2 border-b last:border-b-0">
                      <div className="p-3 bg-secondary/30 font-medium">Subcategory</div>
                      <div className="p-3">{product.subcategory}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Product Code</div>
                    <div className="p-3">{product.productCode}</div>
                  </div>
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Stock</div>
                    <div className="p-3">{product.stock} units</div>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Shipping</div>
                    <div className="p-3">Free over 100 BDT</div>
                  </div>
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Warranty</div>
                    <div className="p-3">1 Year</div>
                  </div>
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Rating</div>
                    <div className="p-3">{product.rating} / 5</div>
                  </div>
                  <div className="grid grid-cols-2 border-b last:border-b-0">
                    <div className="p-3 bg-secondary/30 font-medium">Reviews</div>
                    <div className="p-3">{product.reviews}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-4">
              <h3 className="text-xl font-semibold">Customer Reviews</h3>
              <p className="text-muted-foreground">
                This product has {product.reviews} reviews with an average rating of {product.rating} out of 5 stars.
              </p>
              <div className="mt-6 space-y-4">
                {/* Sample reviews - in a real app, these would come from the database */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < 5 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">John D.</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 months ago</span>
                  </div>
                  <p className="text-sm">Excellent product! It exceeded my expectations in every way. The quality is outstanding and I would definitely recommend it to anyone looking for a premium experience.</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">Sarah M.</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 month ago</span>
                  </div>
                  <p className="text-sm">Very satisfied with my purchase. The product is well-made and works perfectly for my needs. Shipping was fast too!</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        {loadingRelated ? (
          // Loading skeletons for related products
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
          // Actual related products
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
          // No related products found
          <div className="text-center py-8 border rounded-lg bg-secondary/10">
            <p className="text-muted-foreground">No related products found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 