"use client";

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
              <p className="text-muted-foreground text-lg">
                Please read these terms carefully before using our services.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to Selzio ("we," "our," or "us"). These Terms and Conditions govern your use of our website, services, and products. By accessing or using Selzio, you agree to be bound by these Terms.
                </p>
                <p className="text-muted-foreground mb-4">
                  If you do not agree with any part of these Terms, you may not use our services.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Account Registration</h2>
                <p className="text-muted-foreground mb-4">
                  To access certain features of our platform, you may need to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="text-muted-foreground mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">3. Product Information</h2>
                <p className="text-muted-foreground mb-4">
                  We strive to provide accurate product descriptions, pricing, and availability information. However, we do not warrant that product descriptions, pricing, or other content on our platform is accurate, complete, reliable, current, or error-free.
                </p>
                <p className="text-muted-foreground mb-4">
                  Colors may appear differently on your screen than on the actual product. We make reasonable efforts to display as accurately as possible the colors of our products.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Pricing and Payment</h2>
                <p className="text-muted-foreground mb-4">
                  All prices are in Bangladeshi Taka (BDT) and are inclusive of VAT where applicable. We reserve the right to change prices at any time without prior notice.
                </p>
                <p className="text-muted-foreground mb-4">
                  Payment must be made through one of our accepted payment methods. By providing payment information, you represent and warrant that you are authorized to use the designated payment method.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Order Acceptance and Fulfillment</h2>
                <p className="text-muted-foreground mb-4">
                  Your receipt of an order confirmation does not constitute our acceptance of your order. We reserve the right to limit or cancel quantities purchased per person, per household, or per order.
                </p>
                <p className="text-muted-foreground mb-4">
                  We may, in our sole discretion, refuse or cancel any order, limit or cancel quantities purchased, and terminate accounts for any reason, including but not limited to product availability, errors in product or pricing information, or suspicion of fraudulent activity.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Shipping and Delivery</h2>
                <p className="text-muted-foreground mb-4">
                  Delivery timeframes are estimates only and commence from the date of shipping, not the date of order. We are not responsible for delivery delays beyond our control.
                </p>
                <p className="text-muted-foreground mb-4">
                  For more information, please refer to our <Link href="/shipping" className="text-primary hover:underline">Shipping Policy</Link>.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Returns and Refunds</h2>
                <p className="text-muted-foreground mb-4">
                  For information on returns and refunds, please refer to our <Link href="/returns" className="text-primary hover:underline">Returns Policy</Link>.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">8. User Conduct</h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to use our platform for any illegal or unauthorized purpose. You must not, in the use of our services, violate any laws in your jurisdiction.
                </p>
                <p className="text-muted-foreground mb-4">
                  You agree not to attempt to gain unauthorized access to our systems or engage in any activity that disrupts or interferes with our services.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  All content on our platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, is the property of Selzio or its content suppliers and is protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground mb-4">
                  You may not reproduce, duplicate, copy, sell, resell, or otherwise exploit any portion of our platform without our express written consent.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  In no event shall Selzio, its officers, directors, employees, or agents, be liable to you for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any use or inability to use our services.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our liability is limited to the maximum extent permitted by law.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Modifications to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our platform. Your continued use of our services following the posting of revised Terms means that you accept and agree to the changes.
                </p>
              </div>

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Have Questions About Our Terms?</h2>
              <p className="text-muted-foreground mb-8">
                If you have any questions or concerns about our Terms and Conditions, please contact our customer support team.
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