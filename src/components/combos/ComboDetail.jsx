"use client"

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getComboByCode } from '@/data/combos';
import { getProductByCode } from '@/data/products';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';
import ComboImageGallery from './ComboImageGallery';
import { motion } from 'framer-motion';

// Helper to get first image from various formats
function getFirstImage(img) {
  if (!img) return '/images/product-placeholder.jpg';
  if (Array.isArray(img)) return img[0] || '/images/product-placeholder.jpg';
  return img;
}

export default function ComboDetail({ comboCode }) {
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(''); // Single size for all products
  const [suggestedCombinations, setSuggestedCombinations] = useState([]);
  const [allProductDetails, setAllProductDetails] = useState([]); // All available products
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Fetch combo data
  useEffect(() => {
    const fetchCombo = async () => {
      try {
        setLoading(true);
        const data = await getComboByCode(comboCode);
        setCombo(data);

        // Initialize product selections
        if (data && data.productOptions) {
          // Fetch all product details
          const productDetails = await Promise.all(
            data.productOptions.map(async (productCode) => {
              const product = await getProductByCode(productCode);
              if (product && data.productImages && data.productImages[productCode]) {
                product.comboSpecificImage = data.productImages[productCode];
              }
              return product;
            })
          );

          setAllProductDetails(productDetails.filter(Boolean));

          // Create suggested combinations
          const suggestions = data.suggestedCombinations || [];
          setSuggestedCombinations(suggestions);

          // Set initial selections to the first 3 products
          if (productDetails.length > 0) {
            const initialSelections = productDetails.filter(Boolean).slice(0, 3);
            setSelectedProducts(initialSelections);

            // Initialize size from sizeDiscounts if available, otherwise from products
            if (data.sizeDiscounts && data.sizeDiscounts.length > 0) {
              setSelectedSize(data.sizeDiscounts[0].size);
            } else {
              const firstProductWithSizes = initialSelections.find(p => p?.sizes?.length > 0);
              if (firstProductWithSizes) {
                setSelectedSize(firstProductWithSizes.sizes[0].name);
              }
            }
          }
        }
      } catch (err) {
        setError('Failed to load combo information. Please try again later.');
        console.error('Error loading combo:', err);
      } finally {
        setLoading(false);
      }
    };

    if (comboCode) {
      fetchCombo();
    }
  }, [comboCode]);

  // Handle product selection
  const handleProductSelection = async (productCode, slotIndex) => {
    try {
      const product = await getProductByCode(productCode);

      if (product) {
        if (combo.productImages && combo.productImages[productCode]) {
          product.comboSpecificImage = combo.productImages[productCode];
        }

        const updatedProducts = [...selectedProducts];
        updatedProducts[slotIndex] = product;
        setSelectedProducts(updatedProducts);
      }
    } catch (err) {
      console.error('Error selecting product:', err);
      toast({
        title: "Error",
        description: "Failed to load product information.",
        variant: "destructive"
      });
    }
  };

  // Handle single size selection for all products
  const handleSizeChange = (size) => {
    setSelectedSize(size);
  };

  // Handle suggested combination selection
  const handleSuggestionSelect = async (suggestion) => {
    try {
      const products = await Promise.all(
        suggestion.products.map(async (productCode) => {
          const product = await getProductByCode(productCode);
          if (product && combo.productImages && combo.productImages[productCode]) {
            product.comboSpecificImage = combo.productImages[productCode];
          }
          return product;
        })
      );

      setSelectedProducts(products.filter(Boolean));

      // Set the single size from the suggestion (use first size)
      if (suggestion.sizes && suggestion.sizes.length > 0) {
        setSelectedSize(suggestion.sizes[0]);
      }

      toast({
        title: "Suggestion Applied",
        description: "The suggested combination has been applied.",
      });
    } catch (err) {
      console.error('Error applying suggestion:', err);
      toast({
        title: "Error",
        description: "Failed to apply the suggested combination.",
        variant: "destructive"
      });
    }
  };

  // Calculate combo price based on selected size
  const calculateComboPrice = () => {
    if (!combo) return 0;

    // If sizeDiscounts are available, use the selected size's combo price
    if (combo.sizeDiscounts && combo.sizeDiscounts.length > 0 && selectedSize) {
      const sizeEntry = combo.sizeDiscounts.find(sd => sd.size === selectedSize);
      if (sizeEntry && sizeEntry.comboPrice > 0) {
        return sizeEntry.comboPrice;
      }
    }

    // Fallback: If there's a set combo price with discount, use that
    if (combo.price && combo.discount) {
      return getDiscountedPrice(combo.price, combo.discount);
    }

    return combo.price || 0;
  };

  // Get available sizes from sizeDiscounts first, then from products
  const getAvailableSizes = () => {
    // Prefer sizeDiscounts as the source of truth
    if (combo?.sizeDiscounts && combo.sizeDiscounts.length > 0) {
      return combo.sizeDiscounts.map(sd => sd.size);
    }
    // Fallback to product sizes
    const sizeSet = new Set();
    const products = selectedProducts.length > 0 ? selectedProducts : allProductDetails;
    products.forEach(product => {
      if (product?.sizes) {
        product.sizes.forEach(size => sizeSet.add(size.name));
      }
    });
    return Array.from(sizeSet);
  };

  // Get the save amount for the currently selected size
  const getSaveAmount = () => {
    if (!combo) return 0;
    if (combo.sizeDiscounts && combo.sizeDiscounts.length > 0 && selectedSize) {
      const sizeEntry = combo.sizeDiscounts.find(sd => sd.size === selectedSize);
      if (sizeEntry) return Math.round(sizeEntry.saveAmount || 0);
    }
    if (combo.discountAmount) return Math.round(combo.discountAmount);
    if (combo.discount > 0) return Math.round(combo.price - getDiscountedPrice(combo.price, combo.discount));
    return 0;
  };

  // Get the max save amount across all sizes (for badge)
  const getMaxSaveAmount = () => {
    if (!combo) return 0;
    if (combo.maxSaveAmount) return Math.round(combo.maxSaveAmount);
    if (combo.sizeDiscounts && combo.sizeDiscounts.length > 0) {
      return Math.round(Math.max(...combo.sizeDiscounts.map(sd => sd.saveAmount || 0)));
    }
    return getSaveAmount();
  };

  // Add combo to cart
  const handleAddToCart = () => {
    const isComplete = selectedProducts.length === 3 &&
      selectedProducts.every(product => product && product.productCode);

    if (!isComplete) {
      toast({
        title: "Incomplete Selection",
        description: "Please select all 3 products for the combo.",
        variant: "destructive"
      });
      return;
    }

    const currentComboPrice = calculateComboPrice();
    const currentSave = getSaveAmount();

    const comboCartItem = {
      comboCode: combo.comboCode,
      name: combo.name,
      price: currentComboPrice,
      originalPrice: combo.price || 0,
      image: getFirstImage(combo.image),
      isCombo: true,
      description: combo.description || null,
      shortDescription: combo.shortDescription || null,
      selectedSize: selectedSize,
      saveAmount: currentSave,
      products: selectedProducts.map((product) => ({
        productCode: product.productCode,
        name: product.name,
        size: selectedSize,
        image: product.comboSpecificImage || getFirstImage(product.image || product.images?.[0])
      }))
    };

    addToCart(comboCartItem, 1);
  };

  // Buy now
  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <Skeleton className="w-full aspect-square rounded-lg" />
          </div>
          <div className="lg:w-1/2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !combo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Combo</h2>
        <p className="text-muted-foreground mb-6">{error || "Combo not found"}</p>
        <Button asChild>
          <a href="/store">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </a>
        </Button>
      </div>
    );
  }

  const availableSizes = getAvailableSizes();
  const currentSaveAmount = getSaveAmount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Combo image gallery */}
        <div className="lg:w-1/2">
          <ComboImageGallery combo={combo} />
        </div>

        {/* Right side - Combo details and product selection */}
        <div className="lg:w-1/2">
          <div className="sticky top-24">
            <motion.h1
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {combo.name}
            </motion.h1>

            <motion.div
              className="mb-6 flex items-baseline gap-3 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {combo.sizeDiscounts && combo.sizeDiscounts.length > 0 ? (
                <>
                  <span className="text-2xl font-medium">
                    {formatPrice(calculateComboPrice())}
                  </span>
                  {currentSaveAmount > 0 && (
                    <Badge className="ml-2 rounded-md bg-black/80 text-white dark:bg-white/90 dark:text-black">
                      Save {currentSaveAmount} ৳
                    </Badge>
                  )}
                </>
              ) : combo.discount > 0 ? (
                <>
                  <span className="text-lg line-through text-muted-foreground font-medium">
                    {formatPrice(combo.price)}
                  </span>
                  <span className="text-2xl font-medium">
                    {formatPrice(calculateComboPrice())}
                  </span>
                  {currentSaveAmount > 0 && (
                    <Badge className="ml-2 rounded-md bg-black/80 text-white dark:bg-white/90 dark:text-black">
                      Save {currentSaveAmount} ৳
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-2xl font-medium">
                  {formatPrice(calculateComboPrice())}
                </span>
              )}
            </motion.div>

            <motion.div
              className="prose prose-sm max-w-none mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-muted-foreground">{combo.description}</p>
            </motion.div>

            {/* Single Size Selection for all products */}
            {availableSizes.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <Label className="font-medium mb-3 block text-lg">Select Size</Label>
                <p className="text-sm text-muted-foreground mb-3">This size will apply to all products in the combo</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`py-2 px-4 rounded-none border transition-all duration-200 ${selectedSize === size
                        ? 'bg-primary text-primary-foreground font-medium border-primary'
                        : 'bg-transparent hover:bg-secondary/50 border-input'
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Suggested combinations */}
            {suggestedCombinations.length > 0 && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-3">Suggested Combinations</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedCombinations.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="rounded-none hover:bg-secondary/80 transition-all duration-300"
                    >
                      {suggestion.name || `Suggestion ${index + 1}`}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Product selection */}
            <motion.div
              className="space-y-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg font-medium mb-3">Select Your Products</h3>

              {[0, 1, 2].map((slotIndex) => {
                const selectedProduct = selectedProducts[slotIndex];

                return (
                  <motion.div
                    key={slotIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + slotIndex * 0.1 }}
                  >
                    <Card className="overflow-hidden border rounded-none shadow-sm hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Product image */}
                          {selectedProduct && (
                            <motion.div
                              className="w-full md:w-1/4"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="aspect-square relative rounded-md overflow-hidden border">
                                <img
                                  src={selectedProduct.comboSpecificImage || getFirstImage(selectedProduct.image || selectedProduct.images?.[0])}
                                  alt={selectedProduct.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </motion.div>
                          )}

                          {/* Product selection dropdown - shows product NAMES */}
                          <div className="flex-1">
                            <div className="mb-4">
                              <Label htmlFor={`product-${slotIndex}`} className="font-medium mb-1.5 block">Product {slotIndex + 1}</Label>
                              <Select
                                value={selectedProduct?.productCode || ''}
                                onValueChange={(value) => handleProductSelection(value, slotIndex)}
                              >
                                <SelectTrigger id={`product-${slotIndex}`} className="rounded-none border-input bg-transparent">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allProductDetails.map((product) => (
                                    <SelectItem key={product.productCode} value={product.productCode}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Show selected size badge (read-only, not editable per product) */}
                            {selectedProduct && selectedSize && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-none">
                                  Size: {selectedSize}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Add to cart and buy now buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Button
                onClick={handleAddToCart}
                className="flex-1 rounded-none py-4 sm:py-4 text-base font-medium w-full"
                size="lg"
                title="Add to Cart"
              >
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 rounded-none py-4 sm:py-4 text-base font-medium w-full"
                size="lg"
                title="Buy Now"
              >
                Buy Now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}