"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const { toast } = useToast();
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
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
        const newItem = { ...product, quantity };
        
        // Store last added item information
        setLastAddedItem({
          product: newItem,
          quantity: quantity
        });
        
        return [...prevItems, newItem];
      }
    });
    
    // Show toast notification
    showAddedToCartToast(product, quantity);
    
    return true; // Return success flag
  };
  
  // Show toast when item is added to cart
  const showAddedToCartToast = (product, quantity) => {
    const { dismiss } = toast({
      title: "Item Added to Cart",
      description: `${quantity > 1 ? `${quantity} × ` : ''}${product.name}`,
      action: (
        <div className="mt-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-green-200 hover:bg-green-100 hover:text-green-800 transition-colors"
            onClick={() => {
              // Dismiss the toast
              dismiss();
              // Open cart drawer
              document.dispatchEvent(new CustomEvent('open-cart-drawer'));
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
  const updateQuantity = (id, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Calculate total quantity
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
    lastAddedItem
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