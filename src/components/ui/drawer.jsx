"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  direction = "bottom",
  ...props
}) => {
  // If direction is an object with responsive breakpoints
  const [activeDirection, setActiveDirection] = React.useState(
    typeof direction === 'object' && direction !== null ? direction.base : direction
  );
  
  React.useEffect(() => {
    // Update direction on client-side only
    if (typeof direction === 'object' && direction !== null && typeof window !== 'undefined') {
      const handleResize = () => {
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        setActiveDirection(isDesktop && direction.md ? direction.md : direction.base);
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [direction]);

  return (
    <DrawerPrimitive.Root 
      shouldScaleBackground={shouldScaleBackground} 
      direction={activeDirection}
      {...props} 
    />
  );
}
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props} />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef(({ className, children, direction = "bottom", ...props }, ref) => {
  // If direction is an object with responsive breakpoints
  const [activeDirection, setActiveDirection] = React.useState(
    typeof direction === 'object' && direction !== null ? direction.base : direction
  );
  
  React.useEffect(() => {
    // Update direction on client-side only
    if (typeof direction === 'object' && direction !== null && typeof window !== 'undefined') {
      const handleResize = () => {
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        setActiveDirection(isDesktop && direction.md ? direction.md : direction.base);
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [direction]);
  
  const getDirectionStyles = () => {
    switch (activeDirection) {
      case "left":
        return "fixed inset-y-0 left-0 right-auto z-50 flex h-full w-3/4 max-w-sm flex-col border-r bg-background"
      case "right":
        return "fixed inset-y-0 right-0 left-auto z-50 flex h-full w-3/4 max-w-sm flex-col border-l bg-background"
      case "top":
        return "fixed inset-x-0 top-0 bottom-auto z-50 flex w-full flex-col rounded-b-[10px] border-b bg-background"
      default: // bottom
        return "fixed inset-x-0 bottom-0 top-auto z-50 flex h-auto flex-col rounded-t-[10px] border bg-background"
    }
  }
  
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          getDirectionStyles(),
          className
        )}
        {...props}>
        {activeDirection === "bottom" && <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
})
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props} />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
