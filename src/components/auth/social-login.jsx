"use client";

import { useState } from 'react';
import { FaFacebook } from 'react-icons/fa';
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
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      // Changed redirect to false to prevent NextAuth from handling the redirect
      const result = await signIn('google', { 
        callbackUrl: redirectUrl,
        redirect: false
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Call the success callback - this will let the parent component handle redirect
      if (onSuccess && !result?.error) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
      console.error('Google login error:', err);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || 'Google login failed. Please try again.'
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true);
    setError('');
    
    try {
      // Changed redirect to false to prevent NextAuth from handling the redirect
      const result = await signIn('facebook', { 
        callbackUrl: redirectUrl,
        redirect: false
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Call the success callback - this will let the parent component handle redirect
      if (onSuccess && !result?.error) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Facebook login failed. Please try again.');
      console.error('Facebook login error:', err);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || 'Facebook login failed. Please try again.'
      });
    } finally {
      setIsFacebookLoading(false);
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
      
      <Button
        type="button"
        variant="outline"
        className="relative"
        disabled={isFacebookLoading}
        onClick={handleFacebookLogin}
      >
        {isFacebookLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        ) : (
          <>
            <div className="absolute left-3 text-blue-600">
              <FaFacebook size={20} />
            </div>
            {compact ? 'Facebook' : 'Continue with Facebook'}
          </>
        )}
      </Button>
    </div>
  );
};

export default SocialLogin; 