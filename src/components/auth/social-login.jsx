"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

const SocialLogin = ({ 
  onSuccess, 
  redirectUrl = '/',
  className = '',
  compact = false 
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [normalizedRedirectUrl, setNormalizedRedirectUrl] = useState(redirectUrl);
  const { toast } = useToast();
  
  // Normalize the redirect URL to ensure it works in all environments
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // If redirectUrl is already a full URL, use it as is
      if (redirectUrl.startsWith('http')) {
        setNormalizedRedirectUrl(redirectUrl);
      } else {
        // Otherwise, prepend the current origin
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}${redirectUrl.startsWith('/') ? '' : '/'}${redirectUrl}`;
        setNormalizedRedirectUrl(fullUrl);
      }
    }
  }, [redirectUrl]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Store the normalized redirect URL in sessionStorage with the full domain
      window.sessionStorage.setItem('auth_redirect', normalizedRedirectUrl);
      
      // Also store in a cookie that can be accessed by the server
      document.cookie = `auth_redirect=${encodeURIComponent(normalizedRedirectUrl)};path=/;max-age=300;SameSite=Lax${window.location.protocol === 'https:' ? ';Secure' : ''}`;
      
      // Also store in a session_redirect cookie for our custom redirect handler
      document.cookie = `session_redirect=${encodeURIComponent(normalizedRedirectUrl)};path=/;max-age=300;SameSite=Lax${window.location.protocol === 'https:' ? ';Secure' : ''}`;
      
      // Also store the current domain for NextAuth to use
      window.sessionStorage.setItem('site_domain', window.location.origin);
      
      // For NextAuth callback, use our custom redirect handler
      const callbackUrl = '/api/auth/callback/redirect';
      
      // Important: We need to use redirect: true for the OAuth popup to work correctly
      await signIn('google', { 
        callbackUrl,
        redirect: true
      });
      
      // Note: The code below won't execute because the page will redirect
      // The handling of success will happen in the NextAuth callback
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