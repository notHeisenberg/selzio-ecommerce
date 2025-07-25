"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { getDiscountedPrice } from '@/lib/utils';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      // Mark initialization as complete
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setIsInitialized(true); // Still mark as initialized even on error
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if we've initialized
    if (isInitialized) {
      try {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);
  
  // Validate product data
  const validateProduct = (product) => {
    // Ensure required fields exist
    if (!product) return null;
    
    // Handle combo products
    if (product.isCombo) {
      if (!product.comboCode) return null;
      if (!product.name) return null;
      if (typeof product.price !== 'number' || isNaN(product.price)) return null;
      
      // Handle image field for combo
      let imageUrl = '';
      if (product.image) {
        if (typeof product.image === 'string' && product.image.trim() !== '') {
          imageUrl = product.image;
        }
      }
      
      // Create a sanitized version of the combo
      return {
        ...product,
        comboCode: product.comboCode,
        name: product.name,
        price: product.price,
        image: imageUrl,
        isCombo: true,
        quantity: 1,
        // Make sure we keep the products array for combos
        products: product.products || []
      };
    }
    
    // Regular product validation (unchanged)
    if (!product.productCode) return null;
    if (!product.name) return null;
    if (typeof product.price !== 'number' || isNaN(product.price)) return null;
    
    // Handle image field - may be an array or a string
    let imageUrl = '';
    if (product.image) {
      if (Array.isArray(product.image) && product.image.length > 0) {
        // Loop through images to find the first valid one
        for (let i = 0; i < product.image.length; i++) {
          if (typeof product.image[i] === 'string' && product.image[i].trim() !== '') {
            imageUrl = product.image[i];
            break;
          }
        }
        
        // If no valid image found in array, use empty string
        if (imageUrl === '') {
          console.log('No valid image found in product.image array');
        }
      } else if (typeof product.image === 'string' && product.image.trim() !== '') {
        // If image is a string, use it directly if it's not empty
        imageUrl = product.image;
      }
    }
    
    // Create a sanitized version of the product with default values for missing fields
    // but preserve all other product information
    const sanitizedProduct = {
      ...product,  // Keep all original product data
      productCode: product.productCode,
      name: product.name || 'Unnamed Product',
      price: product.price || 0,
      image: imageUrl,
      selectedSize: product.selectedSize || null,
      discount: product.discount || 0,
      quantity: 1,
      // Ensure these fields are included if they exist
      description: product.description || null,
      shortDescription: product.shortDescription || null,
      category: product.category || null,
      subcategory: product.subcategory || null,
      additionalInfo: product.additionalInfo || null
    };
    
    // Handle sizes array specially
    if (product.sizes && Array.isArray(product.sizes)) {
      // Instead of storing the full sizes array, just store stock info for the selected size if available
      if (product.selectedSize) {
        const selectedSizeInfo = product.sizes.find(s => s.name === product.selectedSize);
        if (selectedSizeInfo) {
          sanitizedProduct.sizeStock = selectedSizeInfo.stock;
        }
      }
      
      // Don't store the full sizes array in the cart to avoid duplicating data
      delete sanitizedProduct.sizes;
    }

    return sanitizedProduct;
  };
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    // Validate product data
    const validatedProduct = validateProduct(product);
    if (!validatedProduct) {
      console.error('Invalid product data:', product);
      toast({
        title: "Error",
        description: "Could not add item to cart due to invalid product data.",
        variant: "destructive"
      });
      return false;
    }
    
    setCartItems(prevItems => {
      // Check if this is a combo product
      if (validatedProduct.isCombo) {
        // For combo products, use the comboCode as the unique identifier
        const comboId = validatedProduct.comboCode;
        
        // Check if combo already exists in cart
        const existingComboIndex = prevItems.findIndex(item => 
          item.isCombo && item.comboCode === comboId
        );
        
        if (existingComboIndex !== -1) {
          // Update quantity if combo exists
          const updatedItems = [...prevItems];
          updatedItems[existingComboIndex] = {
            ...updatedItems[existingComboIndex],
            quantity: updatedItems[existingComboIndex].quantity + quantity
          };
          
          // Store last added item information
          setLastAddedItem({
            product: updatedItems[existingComboIndex],
            quantity: quantity
          });
          
          return updatedItems;
        } else {
          // Add new combo to cart
          const newItem = { ...validatedProduct, quantity };
          
          // Store last added item information
          setLastAddedItem({
            product: newItem,
            quantity: quantity
          });
          
          return [...prevItems, newItem];
        }
      } else {
        // Regular product handling (unchanged)
        // Generate a unique identifier for this product + size combination
        const selectedSize = validatedProduct.selectedSize || null;
        const itemId = `${validatedProduct.productCode}${selectedSize ? `-${selectedSize}` : ''}`;
        
        // Check if item already exists in cart with the same size
        const existingItemIndex = prevItems.findIndex(item => {
          // Skip combo products
          if (item.isCombo) return false;
          
          const itemSize = item.selectedSize || null;
          const existingItemId = `${item.productCode}${itemSize ? `-${itemSize}` : ''}`;
          return existingItemId === itemId;
        });
        
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          
          // Store last added item information
          setLastAddedItem({
            product: updatedItems[existingItemIndex],
            quantity: quantity
          });
          
          return updatedItems;
        } else {
          // Add new item to cart
          const newItem = { ...validatedProduct, quantity };
          
          // Store last added item information
          setLastAddedItem({
            product: newItem,
            quantity: quantity
          });
          
          return [...prevItems, newItem];
        }
      }
    });
    
    // Show toast notification
    showAddedToCartToast(validatedProduct, quantity);
    
    return true; // Return success flag
  };
  
  // Show toast when item is added to cart
  const showAddedToCartToast = (product, quantity) => {
    const { dismiss } = toast({
      title: "Item Added to Cart",
      description: `${quantity > 1 ? `${quantity} × ` : ''}${product.name}${product.selectedSize ? ` - Size: ${product.selectedSize}` : ''}`,
      action: (
        <div className="mt-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-green-200 hover:bg-green-100 hover:text-green-800 transition-colors"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              // Navigate to cart page instead of opening drawer
              window.location.href = '/cart';
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
          </Button>
        </div>
      ),
      variant: "success"
    });
  };
  
  // Update item quantity
  const updateQuantity = (productCode, quantity, selectedSize = null) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        // Match by product code and size (if provided)
        const itemSize = item.selectedSize || null;
        const currentSize = selectedSize || null;
        
        if (item.productCode === productCode && itemSize === currentSize) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      })
    );
  };
  
  // Remove item from cart
  const removeItem = (productCode, selectedSize = null) => {
    setCartItems(prevItems => {
      // First check if this is a combo being removed by comboCode
      const comboItems = prevItems.filter(item => 
        item.isCombo && item.comboCode === productCode
      );
      
      if (comboItems.length > 0) {
        // Remove the combo item
        return prevItems.filter(item => !(item.isCombo && item.comboCode === productCode));
      }
      
      // Regular product removal logic
      if (selectedSize) {
        // Remove specific item with size
        return prevItems.filter(item => {
          const itemSize = item.selectedSize || null;
          const currentSize = selectedSize || null;
          return !(item.productCode === productCode && itemSize === currentSize);
        });
      } else {
        // Remove all items with the product code (backwards compatibility)
        return prevItems.filter(item => item.productCode !== productCode);
      }
    });
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Calculate total quantity
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price with discounts
  const totalPrice = cartItems.reduce((sum, item) => {
    // Apply discount if available
    let itemPrice = item.price;
    if (item.discount && item.discount > 0) {
      itemPrice = getDiscountedPrice(itemPrice, item.discount);
    }
    return sum + (itemPrice * item.quantity);
  }, 0);
  
  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    lastAddedItem,
    isInitialized
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 