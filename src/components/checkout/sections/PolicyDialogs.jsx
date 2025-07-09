import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export const TermsDialog = ({ showTermsDialog, setShowTermsDialog }) => {
  return (
    <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
      <DialogContent className="rounded-none border-2 max-w-2xl max-h-[80vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="border-b pb-4 relative">
            <button 
              onClick={() => setShowTermsDialog(false)} 
              className="absolute right-0 top-0 p-2 hover:bg-muted/50 transition-colors rounded-none"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
            <DialogDescription>
              Please read our terms and conditions carefully
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto py-4 pr-2 max-h-[50vh] custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">1. Introduction</h3>
              <p className="text-sm text-muted-foreground">
                Welcome to Selzio. These terms and conditions govern your use of our website and services. 
                By accessing or using our website, you agree to be bound by these terms and conditions. 
                If you disagree with any part of these terms, you may not access the website.
              </p>
              
              <h3 className="text-lg font-semibold">2. Definitions</h3>
              <p className="text-sm text-muted-foreground">
                "Company", "we", "us", or "our" refers to Selzio.
                "Customer", "you", or "your" refers to the person accessing or using our website and services.
                "Products" refers to the items available for purchase on our website.
                "Order" refers to a request by you to purchase products from us.
              </p>
              
              <h3 className="text-lg font-semibold">3. Products and Pricing</h3>
              <p className="text-sm text-muted-foreground">
                All products displayed on our website are subject to availability. We reserve the right to discontinue any product at any time.
                Prices for products are subject to change without notice. We shall not be liable to you or any third party for any price changes.
                We take reasonable steps to ensure that all information on our website about products, including prices, is accurate. However, errors may occur. If we discover an error in the price of products you have ordered, we will inform you as soon as possible and give you the option of reconfirming your order at the correct price or canceling it.
              </p>
              
              <h3 className="text-lg font-semibold">4. Orders and Payment</h3>
              <p className="text-sm text-muted-foreground">
                When you place an order, you are making an offer to purchase products. We may or may not accept your offer at our discretion.
                Payment for all orders must be made in full at the time of ordering. You may pay using the methods specified on our website.
                By submitting an order, you warrant that you are legally capable of entering into binding contracts.
              </p>
              
              <h3 className="text-lg font-semibold">5. Delivery</h3>
              <p className="text-sm text-muted-foreground">
                We will deliver the products to the address you specify when placing your order.
                Delivery times are estimates only and are not guaranteed. We will not be liable for any delay or failure to deliver products within the estimated timeframes.
                Risk of loss and title for products pass to you upon delivery.
              </p>
              
              <h3 className="text-lg font-semibold">6. Cancellation and Refunds</h3>
              <p className="text-sm text-muted-foreground">
                You may cancel your order before it is dispatched. Once an order has been dispatched, you must follow our returns policy.
                Refunds will be processed within 14 days of our receipt of the returned products or your cancellation request, as applicable.
              </p>
              
              <h3 className="text-lg font-semibold">7. Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We collect and process your personal data in accordance with our Privacy Policy, which is available on our website.
              </p>
              
              <h3 className="text-lg font-semibold">8. Limitation of Liability</h3>
              <p className="text-sm text-muted-foreground">
                To the fullest extent permitted by law, we exclude all liability for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our website and services.
              </p>
              
              <h3 className="text-lg font-semibold">9. Changes to Terms</h3>
              <p className="text-sm text-muted-foreground">
                We may revise these terms and conditions at any time by updating this page. By continuing to use our website after any changes, you agree to be bound by the revised terms and conditions.
              </p>
              
              <h3 className="text-lg font-semibold">10. Governing Law</h3>
              <p className="text-sm text-muted-foreground">
                These terms and conditions are governed by and construed in accordance with the laws of Bangladesh, and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Bangladesh.
              </p>
            </motion.div>
          </div>
          <DialogFooter className="border-t pt-4 flex justify-end">
            <Button 
              className="rounded-none hover:bg-primary/90 transition-colors" 
              onClick={() => setShowTermsDialog(false)}
            >
              I Understand
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export const ReturnPolicyDialog = ({ showReturnPolicyDialog, setShowReturnPolicyDialog }) => {
  return (
    <Dialog open={showReturnPolicyDialog} onOpenChange={setShowReturnPolicyDialog}>
      <DialogContent className="rounded-none border-2 max-w-2xl max-h-[80vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="border-b pb-4 relative">
            <button 
              onClick={() => setShowReturnPolicyDialog(false)} 
              className="absolute right-0 top-0 p-2 hover:bg-muted/50 transition-colors rounded-none"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-xl font-bold">Return Policy</DialogTitle>
            <DialogDescription>
              Please read our return policy carefully
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto py-4 pr-2 max-h-[50vh] custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">1. Return Period</h3>
              <p className="text-sm text-muted-foreground">
                You have 7 days from the date of delivery to return a product for a full refund or exchange.
                After this period, we cannot accept returns unless the product is defective.
              </p>
              
              <h3 className="text-lg font-semibold">2. Return Conditions</h3>
              <p className="text-sm text-muted-foreground">
                Products must be returned in their original condition and packaging.
                Products must be unused, unworn, and with all tags attached.
                Products must not be damaged, altered, or washed.
                Products must include all accessories and free gifts that came with them.
              </p>
              
              <h3 className="text-lg font-semibold">3. Non-Returnable Items</h3>
              <p className="text-sm text-muted-foreground">
                For hygiene reasons, we cannot accept returns on:
                - Underwear and intimate apparel
                - Swimwear
                - Beauty products that have been opened or used
                - Products marked as "Final Sale" or "Non-Returnable"
              </p>
              
              <h3 className="text-lg font-semibold">4. Return Process</h3>
              <p className="text-sm text-muted-foreground">
                To initiate a return, please contact our customer service team through the "Contact Us" page on our website.
                You will need to provide your order number, the items you wish to return, and the reason for the return.
                We will provide you with a return authorization and instructions on how to return the products.
                You are responsible for the cost of returning the products unless the products are defective or we sent you the wrong items.
              </p>
              
              <h3 className="text-lg font-semibold">5. Refunds</h3>
              <p className="text-sm text-muted-foreground">
                Refunds will be processed within 14 days of our receipt of the returned products.
                Refunds will be issued to the original payment method used for the purchase.
                Shipping costs are non-refundable unless the products are defective or we sent you the wrong items.
                If you received free shipping on your order, the standard shipping cost will be deducted from your refund.
              </p>
              
              <h3 className="text-lg font-semibold">6. Exchanges</h3>
              <p className="text-sm text-muted-foreground">
                If you wish to exchange a product for a different size or color, please follow the same process as for returns.
                Exchanges are subject to availability.
                If the product you want is not available for exchange, we will issue a refund.
              </p>
              
              <h3 className="text-lg font-semibold">7. Damaged or Defective Products</h3>
              <p className="text-sm text-muted-foreground">
                If you receive a damaged or defective product, please contact our customer service team within 48 hours of delivery.
                We may ask for photographs of the damaged or defective product.
                We will arrange for the product to be collected and replaced or refunded, as you prefer.
              </p>
              
              <h3 className="text-lg font-semibold">8. Changes to Return Policy</h3>
              <p className="text-sm text-muted-foreground">
                We reserve the right to modify this return policy at any time. Any changes will be effective immediately upon posting on our website.
              </p>
            </motion.div>
          </div>
          <DialogFooter className="border-t pt-4 flex justify-end">
            <Button 
              className="rounded-none hover:bg-primary/90 transition-colors" 
              onClick={() => setShowReturnPolicyDialog(false)}
            >
              I Understand
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}; 