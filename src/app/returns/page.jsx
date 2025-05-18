"use client";

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, PackageCheck, AlertCircle, RefreshCw, Truck } from 'lucide-react';
import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Returns & Refunds Policy</h1>
              <p className="text-muted-foreground text-lg">
                We want you to be completely satisfied with your purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Return Policy Overview */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-6">Our Return Policy</h2>
                <p className="text-muted-foreground mb-8">
                  At Selzio, we stand behind our products and want you to be completely satisfied with your purchase. 
                  If you're not entirely happy, we're here to help.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <PackageCheck className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">7-Day Return Window</h3>
                    </div>
                    <p className="text-muted-foreground">
                      You have 7 days from the date of delivery to request a return. 
                      Items must be in their original condition with tags attached.
                    </p>
                  </div>
                  
                  <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <RefreshCw className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">Easy Exchange Process</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Need a different size or color? We offer hassle-free exchanges 
                      subject to product availability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Process Steps */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">How to Return an Item</h2>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Contact Customer Service</h3>
                      <p className="text-muted-foreground mb-2">
                        Contact our customer service team via email, phone, or live chat within 7 days of receiving your order.
                        Provide your order number and details about the item(s) you wish to return or exchange.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Receive Return Authorization</h3>
                      <p className="text-muted-foreground mb-2">
                        Our team will review your request and provide you with a Return Authorization (RA) number 
                        and instructions for packaging your return.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Package Your Return</h3>
                      <p className="text-muted-foreground mb-2">
                        Pack the item(s) securely in the original packaging if possible. Include all tags, accessories, 
                        and the RA number provided by our team.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Ship Your Return</h3>
                      <p className="text-muted-foreground mb-2">
                        You can either use our pickup service (available in select areas) or ship the item 
                        back using your preferred courier service.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-4">
                      <span className="font-bold text-primary">5</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Refund or Exchange Processing</h3>
                      <p className="text-muted-foreground mb-2">
                        Once we receive and inspect your return, we'll process your refund or exchange. 
                        Refunds are typically issued within 5-7 business days to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Refund Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Refund Methods</h3>
                    <p className="text-muted-foreground mb-4">
                      Refunds will be issued to the original payment method used for the purchase:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                      <li>Credit/Debit Card payments will be refunded to the same card</li>
                      <li>bKash/Nagad payments will be refunded to the same account</li>
                      <li>Cash on Delivery (COD) payments will be refunded via bank transfer or mobile payment</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Refund Timeline</h3>
                    <p className="text-muted-foreground mb-2">
                      Once your return is received and inspected, we'll process your refund within 3 business days.
                      Depending on your bank or payment provider, it may take an additional 5-10 business days 
                      for the refund to appear in your account.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Refund Amount</h3>
                    <p className="text-muted-foreground mb-2">
                      You will receive a full refund of the product price. Shipping charges are non-refundable 
                      unless the return is due to our error (such as sending the wrong or defective item).
                    </p>
                  </div>
                </div>
              </div>

              {/* Non-Returnable Items */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Non-Returnable Items</h2>
                
                <div className="bg-muted/30 p-6 rounded-lg border border-border shadow-sm mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-primary mt-1 mr-4 flex-shrink-0" />
                    <p className="text-muted-foreground">
                      For hygiene and safety reasons, certain items cannot be returned or exchanged unless 
                      they arrive damaged or defective.
                    </p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  The following items are non-returnable:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                  <li>Intimate apparel, undergarments, and swimwear</li>
                  <li>Beauty and personal care products that have been opened or had their seals broken</li>
                  <li>Customized or personalized products</li>
                  <li>Downloadable digital products</li>
                  <li>Items marked as "Final Sale" or heavily discounted during clearance sales</li>
                  <li>Products with missing tags, packaging, or accessories</li>
                </ul>
              </div>

              {/* Damaged or Defective Items */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Damaged or Defective Items</h2>
                
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm mb-6">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 text-primary mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Damaged During Shipping</h3>
                      <p className="text-muted-foreground">
                        If your item arrives damaged due to shipping, please take photos of the damaged 
                        package and product, and contact our customer service team within 24 hours of delivery.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-primary mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">Factory Defects</h3>
                      <p className="text-muted-foreground">
                        If your item has a manufacturing defect, please contact our customer service team 
                        within 7 days of delivery with photos of the defect.
                      </p>
                    </div>
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Need Help with a Return?</h2>
              <p className="text-muted-foreground mb-8">
                Our customer service team is here to help you with any questions about returns or exchanges.
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