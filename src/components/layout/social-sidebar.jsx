"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { SiMessenger, SiFacebook } from 'react-icons/si';

// CSS styles to ensure transparent backgrounds
const transparentBg = {
  backgroundColor: 'transparent',
  background: 'none'
};

export function SocialSidebar() {
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants - very minimal
  const iconVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col">
      {/* Messenger Icon */}
      <motion.div
        whileHover="hover"
        initial="initial"
        animate="animate"
      >
        <Link 
          href="https://m.me/selziobd" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 hover:bg-white/5 transition-colors"
        >
          <motion.div 
            className="relative"
            variants={iconVariants}
          >
            <SiMessenger className="h-5 w-5 text-blue-600" />
            <div
              className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-green-500 rounded-full"
            />
          </motion.div>
        </Link>
      </motion.div>

      {/* Facebook Icon */}
      <motion.div
        whileHover="hover"
        initial="initial"
        animate="animate"
      >
        <Link 
          href="https://facebook.com/selziobd" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 hover:bg-white/5 transition-colors"
        >
          <motion.div variants={iconVariants}>
            <SiFacebook className="h-5 w-5 text-blue-600" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Instagram Icon */}
      <motion.div
        whileHover="hover"
        initial="initial"
        animate="animate"
      >
        <Link 
          href="https://instagram.com/selzio_bd" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 hover:bg-white/5 transition-colors"
        >
          <motion.div variants={iconVariants}>
            <Instagram className="h-5 w-5 text-pink-600" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
} 