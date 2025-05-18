"use client";

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, Truck, Clock, MapPin, AlertCircle, PackageOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ShippingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shipping Policy</h1>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about how we deliver your orders.
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Overview */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Our Shipping Services</h2>
                <p className="text-muted-foreground mb-8">
                  At Selzio, we strive to provide reliable, fast, and affordable shipping options for all our customers across Bangladesh.
                  We work with trusted courier partners to ensure your orders reach you safely and on time.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Nationwide Delivery</h3>
                    </div>
                    <p className="text-muted-foreground">
                      We deliver to all 64 districts in Bangladesh, including remote areas.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Fast Processing</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Most orders are processed and shipped within 24 hours of confirmation.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Order Tracking</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Track your package every step of the way with our real-time tracking system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Methods and Costs */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Shipping Methods & Costs</h2>
                
                <div className="overflow-x-auto mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 border border-border font-medium">Location</th>
                        <th className="text-left p-4 border border-border font-medium">Shipping Method</th>
                        <th className="text-left p-4 border border-border font-medium">Estimated Delivery Time</th>
                        <th className="text-left p-4 border border-border font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-4 border border-border">Dhaka City</td>
                        <td className="p-4 border border-border">Express Delivery</td>
                        <td className="p-4 border border-border">1-2 Business Days</td>
                        <td className="p-4 border border-border">৳50</td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td className="p-4 border border-border">Dhaka Suburbs</td>
                        <td className="p-4 border border-border">Standard Delivery <span className='text-xs text-muted-foreground'> (Savar, Gazipur, Narayanganj, Tongi, Keraniganj, etc.)</span></td>
                        <td className="p-4 border border-border">1-2 Business Days</td>
                        <td className="p-4 border border-border">৳100</td>
                      </tr>
                      <tr>
                        <td className="p-4 border border-border">Outside Dhaka (Major Cities)</td>
                        <td className="p-4 border border-border">Standard Delivery <span className='text-xs text-muted-foreground'> (Chittagong, Sylhet, Rajshahi, Barishal, etc.)</span></td>
                        <td className="p-4 border border-border">2-3 Business Days</td>
                        <td className="p-4 border border-border">৳120</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="text-sm text-muted-foreground mb-8">
                  <p><sup>*</sup> Same Day Delivery is available for orders placed before 12:00 PM, subject to product availability and delivery address within Dhaka city limits.</p>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="mb-12">
                <div className="bg-primary/5 p-6 rounded-lg border border-border shadow-sm mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <PackageOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Free Shipping Available!</h3>
                      <p className="text-muted-foreground">
                        Enjoy free shipping on all orders above ৳2000. Applicable nationwide except for remote areas where a reduced shipping fee may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Processing */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Order Processing Timeline</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Order Placement</h3>
                      <p className="text-muted-foreground mb-2">
                        Your order is received and confirmed. You'll receive an order confirmation email or SMS.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Order Processing</h3>
                      <p className="text-muted-foreground mb-2">
                        We prepare your order, including verification, picking, and packing. This typically takes 6-12 hours for in-stock items.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Shipping</h3>
                      <p className="text-muted-foreground mb-2">
                        Your order is handed over to our courier partner. You'll receive a tracking number via email or SMS.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Delivery</h3>
                      <p className="text-muted-foreground mb-2">
                        The courier delivers your order to your specified address. For COD orders, payment is collected at this time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-lg border border-border">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-primary mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-2">Important Notes</h3>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                        <li>Orders placed after 5:00 PM will be processed the next business day</li>
                        <li>Processing times may be longer during peak seasons, promotions, or holidays</li>
                        <li>Pre-order or out-of-stock items will have different processing times, which will be communicated at the time of purchase</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Tracking */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Order Tracking</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                  <div>
                    <p className="text-muted-foreground mb-4">
                      We provide real-time tracking for all orders. Once your order is shipped, you'll receive a tracking number via email or SMS that you can use to track your package.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You can track your order by:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                      <li>Visiting your account dashboard</li>
                      <li>Using the tracking link in your shipping confirmation email</li>
                      <li>Contacting our customer service team with your order number</li>
                    </ul>
                  </div>
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="relative w-full h-60 rounded-md overflow-hidden mb-4">
                      <Image 
                        src="/images/shipping/tracking-illustration.jpg" 
                        alt="Order Tracking" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Track your package every step of the way
                    </p>
                  </div>
                </div>
              </div>

              {/* International Shipping */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">International Shipping</h2>
                
                <div className="bg-muted/30 p-6 rounded-lg border border-border mb-6">
                  <p className="text-muted-foreground">
                    Currently, we only offer shipping within Bangladesh. We plan to expand our services to include international shipping in the future. 
                    Please check back for updates or contact our customer service team for special arrangements.
                  </p>
                </div>
              </div>

              {/* Shipping Policies */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Additional Shipping Policies</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Address Accuracy</h3>
                    <p className="text-muted-foreground mb-2">
                      It is the customer's responsibility to provide accurate and complete shipping information. 
                      We are not responsible for delays or non-delivery due to incorrect address information.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Order Modifications</h3>
                    <p className="text-muted-foreground mb-2">
                      Once an order has been placed, changes to shipping address or shipping method must be requested within 2 hours 
                      and are subject to approval based on processing status.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Shipping Delays</h3>
                    <p className="text-muted-foreground mb-2">
                      While we strive to meet all delivery timeframes, delays may occur due to unforeseen circumstances 
                      such as weather conditions, public holidays, or other factors beyond our control.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Undeliverable Packages</h3>
                    <p className="text-muted-foreground mb-2">
                      If a package cannot be delivered (e.g., no one available to receive it, incorrect address), 
                      the courier will attempt delivery up to three times. After the third attempt, the package will be 
                      returned to our facility, and we will contact you regarding redelivery options.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Shipping?</h2>
              <p className="text-muted-foreground mb-8">
                Our customer service team is here to help with any shipping-related questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild variant="outline" className="group">
                  <Link href="/contact">
                    <Mail className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="https://www.messenger.com/t/selziobd" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 