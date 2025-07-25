import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Tag, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { getDiscountedPrice } from '@/lib/utils';

export const OrderSummary = ({ 
  cartItems, 
  totalItems, 
  subtotal, 
  shippingPrice, 
  discountAmount = 0,
  appliedCoupon, 
  total,
  isMobile = false 
}) => {
  // Calculate total product discount
  const totalProductDiscount = cartItems.reduce((sum, item) => {
    if (item.discount && item.discount > 0) {
      const originalPrice = item.price * item.quantity;
      const discountedPrice = getDiscountedPrice(item.price, item.discount) * item.quantity;
      return sum + (originalPrice - discountedPrice);
    }
    return sum;
  }, 0);

  // Calculate total savings (product discounts + coupon discount)
  const totalSavings = totalProductDiscount + discountAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="overflow-hidden rounded-none border-2">
        <CardHeader className="pb-2">
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </CardDescription>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3' : 'p-6'} space-y-4`}>
          {/* Items List - Fixed height with scroll */}
          <div className="border-2 rounded-none overflow-hidden bg-card/50">
            <div className={`${isMobile ? 'max-h-[200px]' : 'max-h-[320px]'} overflow-y-auto px-3 py-2 space-y-3`}>
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={`${item.isCombo ? item.comboCode : item.productCode}-${item.selectedSize || 'default'}`} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className={`relative ${isMobile ? 'w-14 h-14' : 'w-16 h-16'} rounded-none overflow-hidden border-2 bg-card flex-shrink-0`}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes={isMobile ? "56px" : "64px"}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <div className="flex flex-col gap-0.5">
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      
                      {/* Show combo items */}
                      {item.isCombo && item.products && item.products.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          <p className="text-xs font-medium">Includes:</p>
                          <ul className="list-disc pl-4 mt-0.5">
                            {item.products.map((product, idx) => (
                              <li key={idx} className="text-xs">
                                {product.name} {product.size && `(${product.size})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.discount && item.discount > 0 ? (
                        <div>
                          <p className="text-sm font-semibold">
                            {(getDiscountedPrice(item.price, item.discount) * item.quantity).toFixed(2)} Tk
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            {(item.price * item.quantity).toFixed(2)} Tk
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} Tk</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 text-center text-sm text-muted-foreground">
                  Your cart is empty
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)} Tk</span>
            </div>

            {totalProductDiscount > 0 && (
              <div className="flex justify-between text-sm text-primary">
                <span className="flex items-center">
                  <Percent className="h-3 w-3 mr-1" />
                  Product Discounts
                </span>
                <span>-{totalProductDiscount.toFixed(2)} Tk</span>
              </div>
            )}

            {appliedCoupon && (
              <div className="flex justify-between text-sm text-primary">
                <span className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {appliedCoupon.type === 'percentage'
                    ? `Coupon (${appliedCoupon.discount * 100}%)`
                    : 'Coupon Discount'}
                </span>
                <span>-{discountAmount.toFixed(2)} Tk</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingPrice.toFixed(2)} Tk</span>
            </div>
            
            {/* Total Savings */}
            {totalSavings > 0 && (
              <div className="flex justify-between text-xs bg-green-50 dark:bg-green-900/20 p-1.5 rounded-sm">
                <span className="font-medium text-green-700 dark:text-green-400">Total Savings</span>
                <span className="font-medium text-green-700 dark:text-green-400">
                  -{totalSavings.toFixed(2)} Tk
                </span>
              </div>
            )}
            
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-primary">{total.toFixed(2)} Tk</span>
            </div>

            {appliedCoupon && (
              <div className="mt-1 flex justify-center">
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-none">
                  {appliedCoupon.code} applied
                </span>
              </div>
            )}
          </div>

          {/* Safe Checkout Message - Only show on desktop */}
          {!isMobile && (
            <div className="bg-muted/30 p-3 rounded-none mt-1">
              <h4 className="text-sm font-medium flex items-center mb-1">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                Secure Checkout
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your payment information is processed securely.
              </p>
            </div>
          )}

          {/* Payment Methods Icons */}
          {!isMobile && (
            <div className="flex justify-center mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-5 bg-card/80 border rounded-none flex items-center justify-center">
                  <Image src="/payment/bkash.svg" width={16} height={10} alt="bKash" />
                </div>
                <div className="w-8 h-5 bg-card/80 border rounded-none flex items-center justify-center">
                  <Image src="/payment/nagad.svg" width={16} height={10} alt="Nagad" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Need Help? - Only show on desktop */}
      {!isMobile && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      )}
    </motion.div>
  );
}; 