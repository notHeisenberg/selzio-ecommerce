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
    <div className="relative w-full overflow-hidden h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/Banner.jpg"
          alt="Hero background"
          fill
          className="sm:object-cover object-cover h-full w-full"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-end sm:pb-5 pb-8 justify-center">
        <motion.div 
          className="text-center mb-2 sm:mb-4"
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
                    className="bg-transparent border border-white text-white hover:bg-white/10 rounded-none py-4 px-8 sm:py-5 sm:px-12 md:py-6 md:px-16 text-base md:text-lg transition-all duration-300 hover:border-2"
                  >
                    <Link href="/store" className="flex items-center">
                      Shop Now
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
                    className="bg-transparent text-gray-800 hover:bg-gray-800/10 border border-gray-800 rounded-none py-4 px-8 sm:py-5 sm:px-12 md:py-6 md:px-16 text-base md:text-lg transition-all duration-300 hover:border-2"
                  >
                    <Link href="/store" className="flex items-center">
                      Shop Now
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator - Only visible on mobile */}
      {/* <motion.div 
        className="absolute bottom-2 left-0 right-0 flex justify-center sm:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="flex flex-col items-center"
        >
          <div className={`w-1 h-3 border-l-2 border-r-1 ${mounted && resolvedTheme === 'dark' ? 'border-white' : 'border-gray-800'} opacity-70`}></div>
          <div className={`w-3 h-3 border-b-2 border-r-1 ${mounted && resolvedTheme === 'dark' ? 'border-white' : 'border-gray-800'} opacity-70 transform rotate-45 mt-[-2px]`}></div>
        </motion.div>
      </motion.div> */}
    </div>
  );
} 