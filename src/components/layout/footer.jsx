"use client"

import Link from 'next/link';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Link href="/" className="inline-block">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 mr-3">
                    <Image src="/images/logo.png" alt="Selzio Logo" fill className="object-contain" />
                  </div>
                  <span className="text-2xl font-bold text-foreground dark:text-white">
                    SELZ<span className="text-primary">I</span>O
                  </span>
                </div>
              </Link>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Your one-stop destination for premium fashion and lifestyle products with nationwide delivery across Bangladesh.
            </p>
            <div className="flex space-x-3 mb-6">
              <Link href="https://www.facebook.com/selziobd" className="flex items-center justify-center w-10 h-10 rounded-full bg-background hover:bg-secondary transition-colors">
                <Facebook className="h-5 w-5 text-foreground" />
              </Link>
              <Link href="https://www.instagram.com/selzio_bd" className="flex items-center justify-center w-10 h-10 rounded-full bg-background hover:bg-secondary transition-colors">
                <Instagram className="h-5 w-5 text-foreground" />
              </Link>
              <Link href="https://www.pinterest.com/selziobd/" className="flex items-center justify-center w-10 h-10 rounded-full bg-background hover:bg-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.6 6 9.2 0-.7 0-1.5.2-2.3.2-.9 1.4-6 1.4-6s-.3-.7-.3-1.7c0-1.6.9-2.8 2-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.5 2 1.6 2 1.9 0 3.2-2.5 3.2-5.4 0-2.2-1.5-3.9-4.2-3.9-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .1.1.1.2.1.3 0 .1-.1.5-.1.6-.1.2-.2.3-.4.2-1.2-.5-1.8-1.9-1.8-3.4 0-2.6 2.2-5.6 6.5-5.6 3.5 0 5.8 2.5 5.8 5.2 0 3.6-2 6.2-4.9 6.2-1 0-1.9-.5-2.2-1.1 0 0-.5 2.1-.6 2.5-.2.7-.6 1.5-1 2.1 1 .3 2 .4 3 .4 5.5 0 10-4.5 10-10S17.5 2 12 2z"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    Shipping Policy
                  </Link>
                </li>
              </ul>
              <ul className="space-y-3">
                <li>
                  <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/store" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link href="/account?tab=profile" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mr-2"></span>
                    My Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Basundhara R/A, Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-muted-foreground">
                  <div>+880 1724318584</div>
                  <div>+880 1778053337</div>
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                <span className="text-muted-foreground">selziobd@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-center md:text-left mb-4 md:mb-0">
              © {new Date().getFullYear()} Selzio. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-4 flex-wrap">
              <img src="/payment/bkash.svg" alt="bKash" className="h-10" />
              <img src="/payment/nagad.svg" alt="Nagad" className="h-10" />
              <img src="/payment/cash-on-delivery.svg" alt="cash-on-delivery" className="h-16" />
              <img src="/payment/visa.svg" alt="Visa" className="h-10" />
              <img src="/payment/mastercard.svg" alt="Mastercard" className="h-10" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 