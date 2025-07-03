"use client";
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority";
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes";

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:right-0 md:max-w-[420px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground shadow-md backdrop-blur-sm",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground shadow-md backdrop-blur-sm",
        monochrome:
          "monochrome group border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white shadow-lg backdrop-blur-sm data-[state=open]:animate-shake",
        success:
          "dark:border-green-600/40 dark:bg-green-950/80 dark:text-green-200 border-green-200 bg-green-50/90 text-green-800 shadow-md backdrop-blur-sm",
        info:
          "dark:border-blue-600/40 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 bg-blue-50/90 text-blue-800 shadow-md backdrop-blur-sm",
        warning:
          "dark:border-yellow-600/40 dark:bg-yellow-950/80 dark:text-yellow-200 border-yellow-200 bg-yellow-50/90 text-yellow-800 shadow-md backdrop-blur-sm",
        wishlist:
          "wishlist group border-rose-200 dark:border-rose-800/40 bg-gradient-to-r from-rose-50 to-rose-100/90 dark:from-rose-950/70 dark:to-rose-900/50 text-rose-700 dark:text-rose-200 shadow-md backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    (<ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props} />)
  );
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
        // Default styling
        isDark 
          ? "border-gray-700 hover:border-gray-600" 
          : "border-gray-200 hover:border-gray-300",
        // Destructive toast styling
        "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        // Monochrome toast styling
        "group-[.monochrome]:border-black dark:group-[.monochrome]:border-white group-[.monochrome]:text-black dark:group-[.monochrome]:text-white group-[.monochrome]:hover:bg-black/10 dark:group-[.monochrome]:hover:bg-white/20 group-[.monochrome]:hover:border-black dark:group-[.monochrome]:hover:border-white group-[.monochrome]:transition-all group-[.monochrome]:duration-300",
        // Success toast styling
        isDark
          ? "group-[.success]:border-green-700/50 group-[.success]:text-green-200 group-[.success]:hover:bg-green-800/40 group-[.success]:hover:text-green-100 group-[.success]:hover:border-green-600/70"
          : "group-[.success]:border-green-300 group-[.success]:text-green-800 group-[.success]:hover:bg-green-100 group-[.success]:hover:text-green-900",
        // Info toast styling
        isDark
          ? "group-[.info]:border-blue-700/50 group-[.info]:text-blue-200 group-[.info]:hover:bg-blue-800/40 group-[.info]:hover:text-blue-100 group-[.info]:hover:border-blue-600/70"
          : "group-[.info]:border-blue-300 group-[.info]:text-blue-800 group-[.info]:hover:bg-blue-100 group-[.info]:hover:text-blue-900",
        // Warning toast styling
        isDark
          ? "group-[.warning]:border-yellow-700/50 group-[.warning]:text-yellow-200 group-[.warning]:hover:bg-yellow-800/40 group-[.warning]:hover:text-yellow-100 group-[.warning]:hover:border-yellow-600/70"
          : "group-[.warning]:border-yellow-300 group-[.warning]:text-yellow-800 group-[.warning]:hover:bg-yellow-100 group-[.warning]:hover:text-yellow-900",
        // Wishlist toast styling
        isDark
          ? "group-[.wishlist]:border-rose-700/50 group-[.wishlist]:text-rose-200 group-[.wishlist]:hover:bg-rose-800/40 group-[.wishlist]:hover:text-rose-100 group-[.wishlist]:hover:border-rose-600/70"
          : "group-[.wishlist]:border-rose-300 group-[.wishlist]:text-rose-700 group-[.wishlist]:hover:bg-rose-100 group-[.wishlist]:hover:text-rose-900",
        className
      )}
      {...props} 
    />
  )
})
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      "group-[.monochrome]:text-black/70 group-[.monochrome]:hover:text-black dark:group-[.monochrome]:text-white/70 dark:group-[.monochrome]:hover:text-white group-[.monochrome]:focus:ring-black dark:group-[.monochrome]:focus:ring-white",
      "group-[.success]:text-green-700 group-[.success]:hover:text-green-900 dark:group-[.success]:text-green-300 dark:group-[.success]:hover:text-green-200",
      "group-[.info]:text-blue-700 group-[.info]:hover:text-blue-900 dark:group-[.info]:text-blue-300 dark:group-[.info]:hover:text-blue-200",
      "group-[.warning]:text-yellow-700 group-[.warning]:hover:text-yellow-900 dark:group-[.warning]:text-yellow-300 dark:group-[.warning]:hover:text-yellow-200",
      "group-[.wishlist]:text-rose-500 group-[.wishlist]:hover:text-rose-700 dark:group-[.wishlist]:text-rose-300 dark:group-[.wishlist]:hover:text-rose-200",
      className
    )}
    toast-close=""
    {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold [&+div]:text-xs", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
