"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Define trusted domains for multi-platform deployment
const TRUSTED_DOMAINS = [
  'https://selzio-ecommerce.vercel.app',
  'https://selzio-ecommerce.netlify.app',
  // Add localhost for development
  'http://localhost:3000'
];

// Helper function to determine if we're in development mode
const isDevelopment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost';
};

const SocialLogin = ({ 
  onSuccess, 
  redirectUrl = '/',
  className = '',
  compact = false 
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  // Helper function to determine if a URL matches any of our trusted domains
  const isUrlFromTrustedDomain = (url) => {
    if (!url.startsWith('http')) return false;
    return TRUSTED_DOMAINS.some(domain => url.startsWith(domain));
  };
  
  // Helper function to ensure we're using the correct URL format for the environment
  const getEnvironmentAwareUrl = (url) => {
    if (!url) return '/';
    
    // If it's a relative URL, return as is
    if (url.startsWith('/')) return url;
    
    // In development mode
    if (isDevelopment()) {
      // If the URL is from one of our production domains, convert it to localhost
      if (isUrlFromTrustedDomain(url)) {
        try {
          const urlObj = new URL(url);
          return `http://localhost:3000${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        } catch (e) {
          console.error("Error parsing URL:", e);
          return '/';
        }
      }
      // If not from trusted domain but is still absolute, use pathname only
      if (url.startsWith('http')) {
        try {
          const urlObj = new URL(url);
          return urlObj.pathname || '/';
        } catch (e) {
          return '/';
        }
      }
    }
    
    // For production, use as is
    return url;
  };
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Store the redirect URL in sessionStorage for custom redirect handling
      if (typeof window !== 'undefined') {
        // Handle development vs production URL formats
        const storageUrl = isDevelopment() 
          ? getEnvironmentAwareUrl(redirectUrl) 
          : redirectUrl;
        
        // Store raw redirect URL - can be relative or absolute
        window.sessionStorage.setItem('auth_redirect', storageUrl);
        
        // If we're in production, make sure we're using the correct domain
        if (!isDevelopment()) {
          const currentDomain = window.location.origin;
          
          // If the redirect URL is absolute but from a different trusted domain,
          // store the current domain version as well to ensure proper redirect handling
          if (redirectUrl.startsWith('http') && !redirectUrl.startsWith(currentDomain)) {
            if (isUrlFromTrustedDomain(redirectUrl)) {
              // Store the redirect URL with the current domain for post-auth handling
              const path = new URL(redirectUrl).pathname;
              window.sessionStorage.setItem('auth_redirect', `${currentDomain}${path}`);
            }
          }
        }
      }
      
      // Get the appropriate callback URL for the environment
      const callbackUrl = getEnvironmentAwareUrl(redirectUrl);
      
      // Use callbackUrl (not redirect) as parameter for NextAuth
      await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
      // Code below won't execute due to the page redirect
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
      console.error('Google login error:', err);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || 'Google login failed. Please try again.'
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {error && <div className="text-sm text-red-500">{error}</div>}
      
      <Button
        type="button"
        variant="outline"
        className="relative"
        disabled={isGoogleLoading}
        onClick={handleGoogleLogin}
      >
        {isGoogleLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        ) : (
          <>
            <div className="absolute left-3">
              <Image
                src="/Google__G__logo.svg"
                alt="Google"
                width={20}
                height={20}
              />
            </div>
            {compact ? 'Google' : 'Continue with Google'}
          </>
        )}
      </Button>
    </div>
  );
};

export default SocialLogin; 