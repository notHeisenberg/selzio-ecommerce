"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // FAQ categories and questions
  const faqCategories = [
    {
      id: 'ordering',
      title: 'Ordering & Payment',
      faqs: [
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer: 'We accept multiple payment methods including bKash, Nagad, VISA/Mastercard, and Cash on Delivery (COD). You can choose your preferred payment method during checkout.'
        },
        {
          id: 'order-track',
          question: 'How can I track my order?',
          answer: 'Once your order is shipped, you\'ll receive a tracking number via email or SMS. You can also track your order in real-time from your account dashboard under "Orders" section.'
        },
        {
          id: 'order-cancel',
          question: 'Can I cancel my order after placing it?',
          answer: 'Yes, you can cancel your order if it hasn\'t been shipped yet. Please contact our customer service team immediately. For orders that have already been shipped, you\'ll need to follow our return process.'
        },
        {
          id: 'order-change',
          question: 'Can I change my order details after placing it?',
          answer: 'Minor changes may be possible if the order hasn\'t been processed yet. Please contact our customer service team immediately with your order number and the details you wish to change.'
        }
      ]
    },
    {
      id: 'shipping',
      title: 'Shipping & Delivery',
      faqs: [
        {
          id: 'ship-time',
          question: 'How long does shipping take?',
          answer: 'For orders within Dhaka city, delivery typically takes 1-2 business days. For areas outside Dhaka, delivery usually takes 3-5 business days. Delivery times may be longer for remote areas.'
        },
        {
          id: 'ship-cost',
          question: 'What are your shipping costs?',
          answer: 'Shipping costs vary based on your location and the size of your order. Inside Dhaka, shipping is typically 50 Tk. For locations outside Dhaka, shipping costs range from 100-150 Tk. Free shipping is available for orders above 2000 Tk.'
        },
        {
          id: 'ship-areas',
          question: 'Do you ship to all areas in Bangladesh?',
          answer: 'Yes, we provide nationwide delivery across Bangladesh. Delivery to some remote areas may take additional time.'
        },
        {
          id: 'ship-international',
          question: 'Do you offer international shipping?',
          answer: 'Currently, we only ship within Bangladesh. We plan to expand our international shipping options in the future.'
        }
      ]
    },
    {
      id: 'returns',
      title: 'Returns & Refunds',
      faqs: [
        {
          id: 'return-policy',
          question: 'What is your return policy?',
          answer: 'We accept returns within 7 days of delivery for most items in their original condition with tags attached. Some items like intimate wear, customized products, and sale items may not be eligible for return.'
        },
        {
          id: 'return-process',
          question: 'How do I return an item?',
          answer: 'To initiate a return, please contact our customer service team with your order number and reason for return. We\'ll guide you through the process and provide a return shipping label if applicable.'
        },
        {
          id: 'refund-time',
          question: 'How long do refunds take to process?',
          answer: 'Once we receive your returned item and verify its condition, refunds are typically processed within 5-7 business days. The time it takes for the refund to appear in your account depends on your payment method and bank.'
        },
        {
          id: 'exchange',
          question: 'Can I exchange an item for a different size or color?',
          answer: 'Yes, you can exchange items for a different size or color, subject to availability. Please contact our customer service team within 7 days of receiving your order to arrange an exchange.'
        }
      ]
    },
    {
      id: 'products',
      title: 'Products & Sizing',
      faqs: [
        {
          id: 'size-guide',
          question: 'Do you have a size guide?',
          answer: 'Yes, we provide detailed size guides for all our clothing items. You can find the size guide on each product page under the "Size Guide" tab.'
        },
        {
          id: 'product-quality',
          question: 'What is the quality of your products?',
          answer: 'We pride ourselves on offering high-quality products. All our items undergo strict quality control checks before shipping to ensure they meet our standards.'
        },
        {
          id: 'product-auth',
          question: 'Are your products authentic?',
          answer: 'Yes, all products sold on Selzio are 100% authentic. We source our products directly from authorized manufacturers and trusted suppliers.'
        },
        {
          id: 'product-care',
          question: 'How should I care for my purchases?',
          answer: 'Care instructions vary by product type and material. You can find specific care instructions on the product label and on our product pages under the "Product Details" section.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Security',
      faqs: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'You can create an account by clicking on the "Account" icon in the top right corner of our website, then selecting "Sign Up". Fill in your details, and you\'re all set!'
        },
        {
          id: 'forgot-password',
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on the "Account" icon, select "Login", then click on "Forgot Password". Enter your email address, and we\'ll send you a link to reset your password.'
        },
        {
          id: 'data-security',
          question: 'How do you protect my personal information?',
          answer: 'We use industry-standard encryption and security measures to protect your personal information. We never share your information with third parties without your consent.'
        },
        {
          id: 'update-info',
          question: 'How can I update my account information?',
          answer: 'Log into your account, go to "My Account", then "Edit Profile". From there, you can update your personal information, change your password, and manage your saved addresses.'
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0)
    : faqCategories;

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground text-lg">
                Find answers to common questions about our products, services, and policies.
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  className="pl-10 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-3 text-sm text-primary hover:text-primary/80"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {searchQuery && filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any answers matching "{searchQuery}".
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="mr-2"
                  >
                    Clear Search
                  </Button>
                  <Button asChild>
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {searchQuery && (
                    <div className="mb-8 pb-6 border-b border-border">
                      <p className="text-muted-foreground">
                        Found {filteredFAQs.reduce((acc, category) => acc + category.faqs.length, 0)} results for "{searchQuery}"
                      </p>
                    </div>
                  )}

                  {filteredFAQs.map((category) => (
                    <div key={category.id} className="mb-12">
                      <h2 className="text-2xl font-bold text-foreground mb-6">{category.title}</h2>
                      <Accordion type="single" collapsible className="space-y-4">
                        {category.faqs.map((faq) => (
                          <AccordionItem 
                            key={faq.id} 
                            value={faq.id}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
                              <span className="text-left font-medium">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2 text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Still Have Questions Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-8">
                Can't find the answer you're looking for? Please contact our customer support team.
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