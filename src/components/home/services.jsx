"use client"

import { Truck, Headset, Shield, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function Services() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Delivery Service Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="group h-full relative"
          >
            <div className={`p-8 rounded-xl relative z-10 h-full transition-all duration-500 
              ${mounted && resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/70 border border-gray-700/50 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)]' 
                : 'bg-gradient-to-br from-white to-gray-50/90 border border-gray-200/70 shadow-[0_10px_25px_-15px_rgba(59,130,246,0.3)]'} 
              backdrop-blur-sm
              group-hover:-translate-y-2 
              group-hover:shadow-[0_20px_30px_-12px_rgba(59,130,246,0.25)]
              dark:group-hover:shadow-[0_20px_30px_-15px_rgba(0,0,0,0.9)]
              overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="mb-5 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm
                border border-primary/10 group-hover:border-primary/20 transition-all duration-500
                group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] relative z-10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">Free Delivery</h3>
              <p className="text-muted-foreground relative z-10">Free shipping on all orders over $100</p>
              
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"></div>
            </div>
          </motion.div>

          {/* Support Service Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="group h-full relative"
          >
            <div className={`p-8 rounded-xl relative z-10 h-full transition-all duration-500 
              ${mounted && resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/70 border border-gray-700/50 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)]' 
                : 'bg-gradient-to-br from-white to-gray-50/90 border border-gray-200/70 shadow-[0_10px_25px_-15px_rgba(59,130,246,0.3)]'} 
              backdrop-blur-sm
              group-hover:-translate-y-2 
              group-hover:shadow-[0_20px_30px_-12px_rgba(59,130,246,0.25)]
              dark:group-hover:shadow-[0_20px_30px_-15px_rgba(0,0,0,0.9)]
              overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="mb-5 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm
                border border-primary/10 group-hover:border-primary/20 transition-all duration-500
                group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] relative z-10">
                <Headset className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">24/7 Support</h3>
              <p className="text-muted-foreground relative z-10">Friendly customer support available 24/7</p>
              
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"></div>
            </div>
          </motion.div>

          {/* Secure Payment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="group h-full relative"
          >
            <div className={`p-8 rounded-xl relative z-10 h-full transition-all duration-500 
              ${mounted && resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/70 border border-gray-700/50 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)]' 
                : 'bg-gradient-to-br from-white to-gray-50/90 border border-gray-200/70 shadow-[0_10px_25px_-15px_rgba(59,130,246,0.3)]'} 
              backdrop-blur-sm
              group-hover:-translate-y-2 
              group-hover:shadow-[0_20px_30px_-12px_rgba(59,130,246,0.25)]
              dark:group-hover:shadow-[0_20px_30px_-15px_rgba(0,0,0,0.9)]
              overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="mb-5 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm
                border border-primary/10 group-hover:border-primary/20 transition-all duration-500
                group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] relative z-10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">Secure Payment</h3>
              <p className="text-muted-foreground relative z-10">100% secure and encrypted payment methods</p>
              
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"></div>
            </div>
          </motion.div>

          {/* Returns Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="group h-full relative"
          >
            <div className={`p-8 rounded-xl relative z-10 h-full transition-all duration-500 
              ${mounted && resolvedTheme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/70 border border-gray-700/50 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.8)]' 
                : 'bg-gradient-to-br from-white to-gray-50/90 border border-gray-200/70 shadow-[0_10px_25px_-15px_rgba(59,130,246,0.3)]'} 
              backdrop-blur-sm
              group-hover:-translate-y-2 
              group-hover:shadow-[0_20px_30px_-12px_rgba(59,130,246,0.25)]
              dark:group-hover:shadow-[0_20px_30px_-15px_rgba(0,0,0,0.9)]
              overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="mb-5 bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm
                border border-primary/10 group-hover:border-primary/20 transition-all duration-500
                group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] relative z-10">
                <RefreshCcw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground relative z-10">Easy Returns</h3>
              <p className="text-muted-foreground relative z-10">30-day money-back guarantee</p>
              
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}