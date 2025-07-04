"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function NextAuthProvider({ children }) {
  useEffect(() => {
    // Listen for NextAuth events
    const handleStorageChange = (e) => {
      if (e.key === 'nextauth.message') {
        try {
          const message = JSON.parse(e.newValue);
          
          if (message?.event === 'error') {
            console.error('NextAuth Error:', message.data);
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return (
    <SessionProvider 
      refetchInterval={1 * 60} // Refetch session every minute to keep it fresh
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      {children}
    </SessionProvider>
  );
} 