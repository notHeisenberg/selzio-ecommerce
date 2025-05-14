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
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props} />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success:
          "dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300 border-green-100 bg-green-50 text-green-900",
        info:
          "dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300 border-blue-100 bg-blue-50 text-blue-900",
        warning:
          "dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-100 bg-yellow-50 text-yellow-900",
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
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
        // Default styling
        isDark 
          ? "border-gray-700 hover:border-gray-600" 
          : "border-gray-200 hover:border-gray-300",
        // Destructive toast styling
        "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        // Success toast styling
        isDark
          ? "group-[.success]:border-green-900/40 group-[.success]:text-green-300 group-[.success]:hover:bg-green-900/30 group-[.success]:hover:text-green-300 group-[.success]:hover:border-green-800/70"
          : "group-[.success]:border-green-200 group-[.success]:text-green-800 group-[.success]:hover:bg-green-100 group-[.success]:hover:text-green-900",
        // Info toast styling
        isDark
          ? "group-[.info]:border-blue-900/40 group-[.info]:text-blue-300 group-[.info]:hover:bg-blue-900/30 group-[.info]:hover:text-blue-300 group-[.info]:hover:border-blue-800/70"
          : "group-[.info]:border-blue-200 group-[.info]:text-blue-800 group-[.info]:hover:bg-blue-100 group-[.info]:hover:text-blue-900",
        // Warning toast styling
        isDark
          ? "group-[.warning]:border-yellow-900/40 group-[.warning]:text-yellow-300 group-[.warning]:hover:bg-yellow-900/30 group-[.warning]:hover:text-yellow-300 group-[.warning]:hover:border-yellow-800/70"
          : "group-[.warning]:border-yellow-200 group-[.warning]:text-yellow-800 group-[.warning]:hover:bg-yellow-100 group-[.warning]:hover:text-yellow-900",
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
      "group-[.success]:text-green-700 group-[.success]:hover:text-green-900 dark:group-[.success]:text-green-400 dark:group-[.success]:hover:text-green-300",
      "group-[.info]:text-blue-700 group-[.info]:hover:text-blue-900 dark:group-[.info]:text-blue-400 dark:group-[.info]:hover:text-blue-300",
      "group-[.warning]:text-yellow-700 group-[.warning]:hover:text-yellow-900 dark:group-[.warning]:text-yellow-400 dark:group-[.warning]:hover:text-yellow-300",
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
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
