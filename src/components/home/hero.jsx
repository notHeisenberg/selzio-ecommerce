"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Button hover animation variants
  const buttonVariants = {
    initial: { 
      scale: 1,
      boxShadow: "0px 0px 0px rgba(0,0,0,0)"
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.98
    }
  };

  return (
    <div className="relative h-[550px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/Banner.jpg"
          alt="Hero background"
          fill
          className="sm:object-cover object-contain h-full w-full"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end sm:pb-5 pb-16 justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex gap-6 justify-center">
            {mounted && resolvedTheme === 'dark' ? (
              <>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    asChild 
                    className="bg-transparent border border-white text-white hover:bg-white/10 rounded-none py-5 px-12 md:py-6 md:px-16 md:text-lg transition-all duration-300 hover:border-2"
                  >
                    <Link href="/store" className="flex items-center">
                      Shop Now
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button 
                    asChild 
                    className="bg-transparent text-gray-800 hover:bg-gray-800/10 border border-gray-800 rounded-none py-5 px-12 md:py-6 md:px-16 md:text-lg transition-all duration-300 hover:border-2"
                  >
                    <Link href="/store" className="flex items-center">
                      Shop Now
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 