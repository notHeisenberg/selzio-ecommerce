import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

export const ReviewSection = ({
  cartItems,
  totalItems,
  subtotal,
  shippingPrice,
  discountAmount,
  total,
  watch,
  setValue,
  errors,
  policyAccepted,
  isSubmitting,
  setShowTermsDialog,
  setShowReturnPolicyDialog,
  selectedShipping
}) => {
  return (
    <div id="review-section">
      <h2 className="text-lg font-semibold mb-4">3. Review and Place Order</h2>
      <Card className="rounded-none border-2">
        <CardContent className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-medium">Order Summary</h3>
            
            {/* Items Summary */}
            <div className="border-b pb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Items ({totalItems})</span>
                <span>{subtotal.toFixed(2)} Tk</span>
              </div>
              {cartItems.slice(0, 2).map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate max-w-[70%]">{item.quantity}x {item.name}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} Tk</span>
                </div>
              ))}
              {cartItems.length > 2 && (
                <div className="text-xs text-muted-foreground italic">
                  +{cartItems.length - 2} more items
                </div>
              )}
            </div>
            
            {/* Shipping Summary */}
            <div className="border-b pb-3">
              <h4 className="text-sm font-medium mb-1">Shipping Information</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                <span>Method:</span>
                <span className="text-right">{selectedShipping?.name || 'Standard'}</span>
                <span>Cost:</span>
                <span className="text-right">{shippingPrice} Tk</span>
              </div>
              
              <h4 className="text-sm font-medium mb-1">Delivery Address</h4>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium">{watch('name')}</p>
                <p>{watch('phone')}</p>
                <p className="whitespace-pre-wrap">{watch('address')}</p>
                <p>{watch('city')}</p>
              </div>
            </div>
            
            {/* Payment Summary */}
            <div className="border-b pb-3">
              <h4 className="text-sm font-medium mb-1">Payment Method</h4>
              <div className="text-xs text-muted-foreground">
                {watch('paymentMethod') === 'cod' ? 'Cash on Delivery' : 
                 watch('paymentMethod') === 'bkash' ? 'bKash' : 
                 watch('paymentMethod') === 'nagad' ? 'Nagad' : 'Online Payment'}
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)} Tk</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingPrice.toFixed(2)} Tk</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{discountAmount.toFixed(2)} Tk</span>
              </div>
            )}
            <div className="flex items-center justify-between font-medium border-t pt-2 mt-2">
              <span>Total Amount</span>
              <span className="text-lg font-bold text-primary">{total.toFixed(2)} Tk</span>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-3 border-t pt-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="policyAccepted"
                checked={policyAccepted}
                onCheckedChange={(checked) => {
                  setValue('policyAccepted', checked);
                }}
                className="rounded-none"
              />
              <label
                htmlFor="policyAccepted"
                className="text-sm text-muted-foreground"
                onClick={() => setValue('policyAccepted', !policyAccepted)}
              >
                I agree to the <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTermsDialog(true);
                  }} 
                  className="text-primary hover:underline focus:outline-none"
                >
                  Terms and Conditions
                </button> and <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReturnPolicyDialog(true);
                  }} 
                  className="text-primary hover:underline focus:outline-none"
                >
                  Return Policy
                </button>
              </label>
            </div>
            {errors.policyAccepted && (
              <p className="text-sm text-destructive">{errors.policyAccepted.message}</p>
            )}
          </div>

          {/* Place Order Button */}
          <div className="mt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit" 
                className="w-full rounded-none" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing Order...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 