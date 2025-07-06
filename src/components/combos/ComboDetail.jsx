"use client"

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getComboByCode } from '@/data/combos';
import { getProductByCode } from '@/data/products';
import { formatPrice, getDiscountedPrice } from '@/lib/utils';
import ComboImageGallery from './ComboImageGallery';
import { motion } from 'framer-motion';

export default function ComboDetail({ comboCode }) {
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [suggestedCombinations, setSuggestedCombinations] = useState([]);
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
              // Add the product-specific image from combo if available
              if (data.productImages && data.productImages[productCode]) {
                product.comboSpecificImage = data.productImages[productCode];
              }
              return product;
            })
          );
          
          // Create suggested combinations
          const suggestions = data.suggestedCombinations || [];
          setSuggestedCombinations(suggestions);
          
          // Set initial selections to the first product and first size
          if (productDetails.length > 0) {
            const initialSelections = productDetails.slice(0, 3);
            setSelectedProducts(initialSelections);
            
            // Initialize sizes with first available size for each product
            const initialSizes = {};
            initialSelections.forEach((product, index) => {
              if (product && product.sizes && product.sizes.length > 0) {
                initialSizes[`product-${index}`] = product.sizes[0].name;
              }
            });
            setSelectedSizes(initialSizes);
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
        // Add combo-specific image if available
        if (combo.productImages && combo.productImages[productCode]) {
          product.comboSpecificImage = combo.productImages[productCode];
        }
        
        // Update the selected products array
        const updatedProducts = [...selectedProducts];
        updatedProducts[slotIndex] = product;
        setSelectedProducts(updatedProducts);
        
        // Initialize with first size if available
        if (product.sizes && product.sizes.length > 0) {
          setSelectedSizes(prev => ({
            ...prev,
            [`product-${slotIndex}`]: product.sizes[0].name
          }));
        }
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

  // Handle size selection
  const handleSizeChange = (slotIndex, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [`product-${slotIndex}`]: size
    }));
  };

  // Handle suggested combination selection
  const handleSuggestionSelect = async (suggestion) => {
    try {
      const products = await Promise.all(
        suggestion.products.map(async (productCode) => {
          const product = await getProductByCode(productCode);
          // Add combo-specific image if available
          if (combo.productImages && combo.productImages[productCode]) {
            product.comboSpecificImage = combo.productImages[productCode];
          }
          return product;
        })
      );
      
      setSelectedProducts(products);
      
      // Set sizes from suggestion
      const newSizes = {};
      suggestion.sizes.forEach((size, index) => {
        newSizes[`product-${index}`] = size;
      });
      setSelectedSizes(newSizes);
      
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

  // Calculate combo price
  const calculateComboPrice = () => {
    if (!combo) return 0;
    
    // If there's a set combo price with discount, use that
    if (combo.price && combo.discount) {
      return getDiscountedPrice(combo.price, combo.discount);
    }
    
    // Otherwise calculate based on selected products
    let totalPrice = combo.basePrice || 0;
    
    // Add price for each selected product with its size
    selectedProducts.forEach((product, index) => {
      if (product) {
        const selectedSize = selectedSizes[`product-${index}`];
        const sizeOption = product.sizes?.find(s => s.name === selectedSize);
        
        // Add product price or size-specific price
        if (sizeOption && sizeOption.price) {
          totalPrice += sizeOption.price;
        } else if (product.price) {
          totalPrice += product.price;
        }
      }
    });
    
    return totalPrice;
  };

  // Add combo to cart
  const handleAddToCart = () => {
    // Check if all slots have a product selected
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
    
    // Create a combo item for the cart
    const comboCartItem = {
      comboCode: combo.comboCode,
      name: combo.name,
      price: calculateComboPrice(),
      image: combo.image || (combo.images && combo.images.length > 0 ? combo.images[0] : null),
      isCombo: true,
      products: selectedProducts.map((product, index) => ({
        productCode: product.productCode,
        name: product.name,
        size: selectedSizes[`product-${index}`],
        image: product.comboSpecificImage || product.image || product.images?.[0]
      }))
    };
    
    // Add to cart
    addToCart(comboCartItem, 1);
  };

  // Buy now (add to cart and redirect to checkout)
  const handleBuyNow = () => {
    handleAddToCart();
    // Redirect to checkout page
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
              className="mb-6 flex items-baseline gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {combo.discount > 0 ? (
                <>
                  <span className="text-lg line-through text-muted-foreground font-medium">
                    {formatPrice(combo.price)}
                  </span>
                  <span className="text-2xl font-medium">
                    {formatPrice(calculateComboPrice())}
                  </span>
                  <Badge className="ml-2 rounded-md bg-black/80 text-white dark:bg-white/90 dark:text-black">
                    {combo.discount}% OFF
                  </Badge>
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
                                  src={selectedProduct.comboSpecificImage || selectedProduct.image || (selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : '/images/product-placeholder.jpg')}
                                  alt={selectedProduct.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Product selection */}
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
                                  {combo.productOptions?.map((productCode) => (
                                    <SelectItem key={productCode} value={productCode}>
                                      {productCode}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Size selection - as option buttons */}
                            {selectedProduct && selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                              <div>
                                <Label className="font-medium mb-1.5 block">Size</Label>
                                <div className="flex flex-wrap gap-2">
                                  {selectedProduct.sizes.map((size) => (
                                    <motion.button
                                      key={size.name}
                                      onClick={() => handleSizeChange(slotIndex, size.name)}
                                      className={`py-2 px-3 rounded-none border transition-all duration-200 ${
                                        selectedSizes[`product-${slotIndex}`] === size.name
                                          ? 'bg-primary text-primary-foreground font-medium border-primary'
                                          : 'bg-transparent hover:bg-secondary/50 border-input'
                                      }`}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      {size.name}
                                    </motion.button>
                                  ))}
                                </div>
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