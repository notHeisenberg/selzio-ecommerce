"use client"

import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useTheme } from 'next-themes';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { cartItems, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom event to open the cart drawer
  useEffect(() => {
    const handleOpenCart = () => setOpen(true);
    document.addEventListener('open-cart-drawer', handleOpenCart);
    
    return () => {
      document.removeEventListener('open-cart-drawer', handleOpenCart);
    };
  }, []);

  return (
    <Drawer 
      open={open} 
      onOpenChange={setOpen} 
      direction={{ base: "bottom", md: "right" }}
    >
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:bg-secondary transition-colors duration-300 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      
      <DrawerContent 
        direction={{ base: "bottom", md: "right" }}
        className={`flex flex-col h-[85vh] md:h-full md:w-96 md:max-w-[420px] bg-background border-l border-border
          ${mounted && resolvedTheme === 'dark' 
            ? 'shadow-[0_0_25px_rgba(0,0,0,0.5)]' 
            : 'shadow-[0_0_25px_rgba(100,116,139,0.1)]'
          }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <DrawerHeader className={`px-5 py-4 sticky top-0 z-10 border-b border-border
            ${mounted && resolvedTheme === 'dark' 
              ? 'bg-gray-800/90 backdrop-blur-sm shadow-sm border-gray-700/50' 
              : 'bg-card/90 backdrop-blur-sm shadow-sm'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <DrawerTitle className="text-lg font-semibold text-foreground">Your Shopping Cart</DrawerTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium
                  ${mounted && resolvedTheme === 'dark'
                    ? 'text-gray-400'
                    : 'text-slate-500'
                  }`}>
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
                <DrawerClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-full transition-all duration-200 transform hover:scale-105
                      ${mounted && resolvedTheme === 'dark'
                        ? 'hover:bg-gray-700 hover:text-blue-300'
                        : 'hover:bg-violet-100 hover:text-violet-700'
                      }`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>
          
          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex gap-4 pb-4 last:border-0 border-b
                      ${mounted && resolvedTheme === 'dark'
                        ? 'border-gray-700/50'
                        : 'border-slate-200'
                      }`}
                  >
                    <div className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 
                      ${mounted && resolvedTheme === 'dark'
                        ? 'bg-gray-700 border border-gray-600 shadow-md'
                        : 'bg-white border border-slate-200 shadow-sm'
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium truncate mb-1
                        ${mounted && resolvedTheme === 'dark'
                          ? 'text-gray-200'
                          : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p className={`text-base font-semibold mb-2
                        ${mounted && resolvedTheme === 'dark'
                          ? 'text-blue-400'
                          : 'text-violet-700'
                        }`}
                      >
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-7 w-7 rounded-full shadow-sm transition-all duration-200
                            ${mounted && resolvedTheme === 'dark'
                              ? 'border-gray-600 hover:scale-110 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                              : 'border-border hover:scale-110 hover:border-primary/30 hover:bg-secondary hover:text-primary'
                            }`}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center text-foreground">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-7 w-7 rounded-full shadow-sm transition-all duration-200
                            ${mounted && resolvedTheme === 'dark'
                              ? 'border-gray-600 hover:scale-110 hover:border-blue-500/30 hover:bg-gray-700 hover:text-blue-400'
                              : 'border-border hover:scale-110 hover:border-primary/30 hover:bg-secondary hover:text-primary'
                            }`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 rounded-full hover:scale-110 transition-all duration-200 ml-auto
                            ${mounted && resolvedTheme === 'dark'
                              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                              : 'text-destructive hover:bg-destructive/10 hover:text-destructive'
                            }`}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 
                ${mounted && resolvedTheme === 'dark'
                  ? 'bg-gray-800/30 rounded-lg border border-gray-700/30'
                  : 'bg-slate-50 rounded-lg'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`rounded-full p-3 
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-slate-100'
                    }`}
                  >
                    <ShoppingCart className={`h-6 w-6 
                      ${mounted && resolvedTheme === 'dark'
                        ? 'text-gray-400'
                        : 'text-slate-400'
                      }`} 
                    />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Your cart is empty</h4>
                <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
                <Button 
                  onClick={() => {
                    router.push('/store');
                    setOpen(false);
                  }}
                  className={`px-5 group
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                >
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className={`border-t border-border p-5 sticky bottom-0 mt-auto
              ${mounted && resolvedTheme === 'dark'
                ? 'bg-gray-800/90 backdrop-blur-sm shadow-[0_-2px_15px_rgba(0,0,0,0.15)] border-gray-700/50'
                : 'bg-card shadow-[0_-2px_15px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className={`border-t pt-2 mt-2 
                  ${mounted && resolvedTheme === 'dark'
                    ? 'border-gray-700/50'
                    : 'border-border'
                  }`}
                ></div>
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className={`w-full group shadow-md hover:shadow-lg transform hover:translate-y-[-1px] transition-all duration-200
                  ${mounted && resolvedTheme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-primary hover:bg-primary-hover text-primary-foreground'
                  }`}
                onClick={() => {
                  router.push('/checkout');
                  setOpen(false);
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full mt-2 transition-all duration-200
                  ${mounted && resolvedTheme === 'dark'
                    ? 'text-gray-400 hover:text-blue-300 hover:bg-gray-700/50'
                    : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                  }`}
                onClick={() => setOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer; 