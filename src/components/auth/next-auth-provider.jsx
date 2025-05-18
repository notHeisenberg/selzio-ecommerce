"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function NextAuthProvider({ children }) {
  useEffect(() => {
    // Listen for NextAuth events for debugging purposes
    const handleStorageChange = (e) => {
      if (e.key === 'nextauth.message') {
        try {
          const message = JSON.parse(e.newValue);
          console.log('NextAuth Event:', message);
          
          // Log specific events for debugging
          if (message?.event === 'session' && message?.data?.trigger === 'getSession') {
            console.log('Session retrieved:', message.data);
          }
          
          if (message?.event === 'signIn' || message?.event === 'signOut') {
            console.log(`User ${message.event}:`, message.data);
          }
          
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