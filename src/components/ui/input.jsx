import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  // Set appropriate autocomplete attribute for password fields if not explicitly provided
  const inputProps = {...props};
  
  // Add autocomplete attribute for password fields if not already set
  if (type === "password" && !inputProps.autoComplete) {
    inputProps.autoComplete = "current-password";
  }
  
  return (
    (<input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...inputProps} />)
  );
})
Input.displayName = "Input"

export { Input }
