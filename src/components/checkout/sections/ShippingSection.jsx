import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';
import { shippingMethods } from './ShippingMethods';
import { useState } from 'react';
import { Combobox } from '@/components/ui/combobox';

// Bangladesh cities list
const bangladeshCities = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chittagong", label: "Chittagong" },
  { value: "khulna", label: "Khulna" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "sylhet", label: "Sylhet" },
  { value: "barishal", label: "Barishal" },
  { value: "rangpur", label: "Rangpur" },
  { value: "comilla", label: "Comilla" },
  { value: "narayanganj", label: "Narayanganj" },
  { value: "gazipur", label: "Gazipur" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "savar", label: "Savar" },
  { value: "tongi", label: "Tongi" },
  { value: "bogura", label: "Bogura" },
  { value: "dinajpur", label: "Dinajpur" },
  { value: "cox_bazar", label: "Cox's Bazar" },
  { value: "jessore", label: "Jessore" },
  { value: "tangail", label: "Tangail" },
  { value: "kushtia", label: "Kushtia" },
  { value: "pabna", label: "Pabna" },
];

export const ShippingSection = ({
  register,
  errors,
  watch,
  setValue,
  isAuthenticated
}) => {
  const selectedShippingMethod = watch('shippingMethod');
  const [cityValue, setCityValue] = useState("");

  // Handle city selection
  const handleCityChange = (value) => {
    setCityValue(value);
    // Find the label for the selected city
    const selectedCity = bangladeshCities.find(city => city.value === value);
    // Update the form value with the city label
    setValue('city', selectedCity?.label || value);
  };

  return (
    <div id="shipping-section">
      <h2 className="text-xl font-semibold mb-4">1. Shipping Information</h2>
      <Card className="rounded-none border-2">
        <CardContent className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  className="rounded-none"
                  {...register('name', { required: 'Full name is required' })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  className="rounded-none"
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-none"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Shipping Address</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address <span className="text-destructive">*</span></Label>
              <textarea
                id="address"
                className="flex w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter your complete address"
                rows={3}
                {...register('address', { required: 'Address is required' })}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
              <Combobox
                options={bangladeshCities}
                value={cityValue}
                onValueChange={handleCityChange}
                placeholder="Select or search your city..."
                searchPlaceholder="Type to search cities..."
                emptyMessage="No city found, try a different search."
                buttonClassName="border-input bg-transparent"
                popoverClassName="w-full"
                title="Select Your City"
              />
              {/* Hidden input to store the city value for the form */}
              <input type="hidden" {...register('city', { required: 'City is required' })} />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Save Information - only shown for authenticated users */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveInfo"
                {...register('saveInfo')}
                className="rounded-none"
              />
              <label
                htmlFor="saveInfo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Save this information for next time
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Methods */}
      <div className="mt-6">
        <Card className="rounded-none border-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
            <div className="space-y-3">
              {shippingMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`flex items-center justify-between rounded-none border-2 p-4 
                    ${selectedShippingMethod === method.id ? 'border-primary bg-primary/5' : 'border-border'}
                    cursor-pointer
                  `}
                  onClick={() => setValue('shippingMethod', method.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value={method.id}
                      id={`shipping-${method.id}`}
                      checked={selectedShippingMethod === method.id}
                      onChange={() => setValue('shippingMethod', method.id)}
                      className="h-4 w-4 rounded-full border-gray-400 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:text-blue-400 dark:focus:ring-blue-500 accent-blue-600"
                      style={{ accentColor: '#2563eb' }}
                      {...register('shippingMethod')}
                    />
                    <Label
                      htmlFor={`shipping-${method.id}`}
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="font-medium">{method.name}</span>
                      <span className="text-sm text-muted-foreground">{method.deliveryTime}</span>
                      <span className="text-xs text-muted-foreground">
                        {method.areas.join(', ')}
                      </span>
                    </Label>
                  </div>
                  <span className="font-medium">
                    {method.price} Tk
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 