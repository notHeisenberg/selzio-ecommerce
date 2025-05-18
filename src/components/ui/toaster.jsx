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

export function Toaster() {
  const { toasts } = useToast()

  return (
    (<ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          (<Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && (
                <div className="flex items-center space-x-2">
                  {props.variant === 'success' && (
                    <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                  )}
                  {props.variant === 'destructive' && (
                    <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400"></div>
                  )}
                  {props.variant === 'info' && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                  )}
                  {props.variant === 'warning' && (
                    <div className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
                  )}
                  <ToastTitle>{title}</ToastTitle>
                </div>
              )}
              {description && (
                <ToastDescription className="pl-4">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>)
        );
      })}
      <ToastViewport />
    </ToastProvider>)
  );
}
