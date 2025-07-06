"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram, ChevronRight, ChevronLeft } from 'lucide-react';

export function SocialSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation variants
  const sidebarVariants = {
    collapsed: {
      width: "48px",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    expanded: {
      width: "160px",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400
      }
    },
    hover: {
      scale: 1.1,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400
      }
    }
  };

  return (
    <div className="fixed right-0 bottom-20 z-40 flex flex-col">
      {/* Toggle Button */}
      <motion.button
        className="w-12 h-12 border border-border bg-background/80 backdrop-blur-md shadow-md flex items-center justify-center self-end"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isExpanded ? (
          <ChevronRight className="h-5 w-5 text-primary" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-primary" />
        )}
      </motion.button>

      {/* Social Options Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute right-0 bottom-14 bg-background/80 backdrop-blur-md border border-border shadow-lg overflow-hidden"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={sidebarVariants}
          >
            <motion.div
              className="flex flex-col"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Link 
                href="https://m.me/selziobd" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-4 px-3 hover:bg-primary/5 transition-colors"
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                  className="relative"
                >
                  <MessageCircle className="h-6 w-6 text-primary" />
                  <motion.div
                    className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                </motion.div>
                
                <motion.span
                  variants={iconVariants}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Messenger
                </motion.span>
              </Link>

              <Link 
                href="https://instagram.com/selzio_bd" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-4 px-3 hover:bg-primary/5 transition-colors"
              >
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                  <Instagram className="h-6 w-6 text-pink-600" />
                </motion.div>
                
                <motion.span
                  variants={iconVariants}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Instagram
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 