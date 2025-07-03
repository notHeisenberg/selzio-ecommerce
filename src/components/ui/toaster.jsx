"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { motion } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  return (
    (<ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Determine if this is a wishlist toast
        const isWishlistToast = title && title.includes('Wishlist');
        
        // Use the wishlist variant for wishlist toasts
        if (isWishlistToast && props.variant === 'default') {
          props.variant = 'wishlist';
        }
        
        // Use monochrome variant for destructive toasts
        if (props.variant === 'destructive') {
          props.variant = 'monochrome';
        }
        
        return (
          (<Toast 
            key={id} 
            {...props}
          >
            <div className="grid gap-1">
              {title && (
                <motion.div 
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {props.variant === 'success' && (
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    ></motion.div>
                  )}
                  {props.variant === 'monochrome' && (
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-black dark:bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    ></motion.div>
                  )}
                  {props.variant === 'info' && (
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    ></motion.div>
                  )}
                  {props.variant === 'warning' && (
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    ></motion.div>
                  )}
                  {props.variant === 'wishlist' && (
                    <motion.div 
                      className="h-2 w-2 rounded-full bg-rose-500 dark:bg-rose-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    ></motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <ToastTitle>{title}</ToastTitle>
                  </motion.div>
                </motion.div>
              )}
              {description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <ToastDescription className="pl-4">
                    {description}
                  </ToastDescription>
                </motion.div>
              )}
            </div>
            {action && (
              <motion.div 
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {action}
              </motion.div>
            )}
            <ToastClose />
          </Toast>)
        );
      })}
      <ToastViewport />
    </ToastProvider>)
  );
}
