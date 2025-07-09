import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { paymentMethods } from './PaymentMethods';

export const PaymentSection = ({
  register,
  errors,
  watch,
  setValue,
  screenshotPreview,
  setScreenshotPreview
}) => {
  const selectedPaymentMethod = watch('paymentMethod');

  // Clear transaction ID when switching payment methods
  useEffect(() => {
    if (selectedPaymentMethod === 'cod') {
      setValue('transactionId', '');
      setScreenshotPreview('');
    }
  }, [selectedPaymentMethod, setValue, setScreenshotPreview]);

  return (
    <div id="payment-section">
      <h2 className="text-lg font-semibold mb-4">2. Payment Information</h2>
      <Card className="rounded-none border-2">
        <CardContent className="p-6">
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex items-center space-x-3 rounded-none border-2 p-4 cursor-pointer
                  ${selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border'}
                `}
                onClick={() => {
                  setValue('paymentMethod', method.id);
                  if (method.id === 'cod') {
                    setValue('transactionId', '');
                    setScreenshotPreview('');
                  }
                }}
              >
                <input
                  type="radio"
                  id={`payment-${method.id}`}
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={() => setValue('paymentMethod', method.id)}
                  className="h-4 w-4 rounded-full border-gray-400 text-black focus:ring-black dark:border-gray-600 dark:text-white dark:focus:ring-white accent-black"
                  style={{ accentColor: 'black' }}
                  {...register('paymentMethod')}
                />
                <Label
                  htmlFor={`payment-${method.id}`}
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {method.icon}
                  </div>
                  <span className="font-medium">{method.name}</span>
                </Label>
              </motion.div>
            ))}
          </div>

          {/* Payment Method Details with AnimatePresence */}
          <AnimatePresence mode="wait">
            {/* Mobile Financial Service Payment Details */}
            {(selectedPaymentMethod === 'bkash' || selectedPaymentMethod === 'nagad') && (
              <motion.div 
                key={`payment-${selectedPaymentMethod}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6 space-y-4 p-4 border-2 rounded-none bg-card/50 overflow-hidden"
              >
                <h4 className="font-medium mb-1">
                  {selectedPaymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Instructions
                </h4>

                <div className="space-y-4">
                  <div className="bg-muted/40 p-3 rounded-none">
                    <p className="text-sm">
                      Please send the payment to the following {selectedPaymentMethod === 'bkash' ? 'bKash' : 'Nagad'} number:
                    </p>
                    <div className="font-medium mt-1 text-center p-2 bg-primary/5 rounded-none border-2 border-primary/20">
                      {selectedPaymentMethod === 'bkash' ? '01724318584' : '01778053337'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      After sending the payment, please provide the Transaction ID (TrxID) below or upload a screenshot of the payment confirmation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID (TrxID) <span className="text-destructive">*</span></Label>
                    <Input
                      id="transactionId"
                      placeholder="e.g. 9HV7AB5DTX"
                      className="rounded-none"
                      {...register('transactionId', {
                        required: selectedPaymentMethod === 'bkash' || selectedPaymentMethod === 'nagad'
                          ? 'Transaction ID is required'
                          : false
                      })}
                    />
                    {errors.transactionId && (
                      <p className="text-sm text-destructive">{errors.transactionId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentScreenshot">Payment Screenshot (Optional)</Label>
                    <Input
                      id="paymentScreenshot"
                      type="file"
                      accept="image/*"
                      className="rounded-none"
                      {...register('paymentScreenshot')}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => setScreenshotPreview(e.target?.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>

                  {screenshotPreview && (
                    <div className="mt-2 relative">
                      <div className="relative h-40 border-2 rounded-none overflow-hidden">
                        <Image
                          src={screenshotPreview}
                          alt="Payment screenshot"
                          fill
                          sizes="100%"
                          className="object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-none"
                        onClick={() => {
                          setScreenshotPreview('');
                          setValue('paymentScreenshot', null);
                        }}
                      >
                        &times;
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Cash on Delivery Information */}
            {selectedPaymentMethod === 'cod' && (
              <motion.div 
                key="payment-cod"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6 space-y-4 p-4 border-2 rounded-none bg-card/50 overflow-hidden"
              >
                <h4 className="font-medium mb-1">Cash on Delivery Information</h4>
                <div className="space-y-3">
                  <div className="bg-muted/40 p-3 rounded-none">
                    <p className="text-sm">
                      Pay with cash upon delivery of your order. Please have the exact amount ready.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: Cash on Delivery may not be available for certain products or delivery areas.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}; 