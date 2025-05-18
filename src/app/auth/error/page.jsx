"use client";

import React, { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { checkProviderEnvVars } from '@/lib/env-check';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    title: 'Authentication Error',
    description: 'An error occurred during authentication.',
    advice: 'Please try again or contact support if the issue persists.',
    providerIssue: false,
    provider: null,
  });
  
  useEffect(() => {
    // Get error information from URL
    const error = searchParams.get('error');
    
    if (!error) return;
    
    let errorInfo = {
      title: 'Authentication Error',
      description: 'An error occurred during authentication.',
      advice: 'Please try again or contact support if the issue persists.',
      providerIssue: false,
      provider: null,
    };
    
    // Map errors to user-friendly messages
    if (error === 'Configuration') {
      errorInfo = {
        title: 'Provider Configuration Error',
        description: 'The authentication provider is not properly configured.',
        advice: 'Please check environment variables and provider setup.',
        providerIssue: true,
      };
    } else if (error === 'AccessDenied') {
      errorInfo = {
        title: 'Access Denied',
        description: 'You denied access to your account or the provider denied the request.',
        advice: 'Please try again and approve the authentication request.',
      };
    } else if (error === 'OAuthSignin') {
      errorInfo = {
        title: 'OAuth Sign-in Error',
        description: 'An error occurred while starting the OAuth sign-in flow.',
        advice: 'Please check your network connection and try again.',
        providerIssue: true,
      };
    } else if (error === 'OAuthCallback') {
      errorInfo = {
        title: 'OAuth Callback Error',
        description: 'An error occurred during the OAuth callback.',
        advice: 'This might be due to misconfigured callback URLs or permissions.',
        providerIssue: true,
      };
    } else if (error === 'OAuthAccountNotLinked') {
      errorInfo = {
        title: 'Account Not Linked',
        description: 'The email on this account is already associated with another provider.',
        advice: 'Please sign in using the original provider or link the accounts.',
      };
    } else if (error === 'Callback') {
      errorInfo = {
        title: 'Callback Error',
        description: 'An error occurred during the authentication callback.',
        advice: 'This might be a temporary issue. Please try again.',
      };
    } else if (error.toLowerCase().includes('facebook')) {
      errorInfo = {
        title: 'Facebook Authentication Error',
        description: 'An error occurred when authenticating with Facebook.',
        advice: 'Please check Facebook app configuration and permissions.',
        providerIssue: true,
        provider: 'facebook',
      };
    } else if (error.toLowerCase().includes('google')) {
      errorInfo = {
        title: 'Google Authentication Error',
        description: 'An error occurred when authenticating with Google.',
        advice: 'Please check Google OAuth configuration and permissions.',
        providerIssue: true,
        provider: 'google',
      };
    }
    
    // Check provider environment variables if it's a provider issue
    if (errorInfo.providerIssue && errorInfo.provider) {
      const providerConfigured = checkProviderEnvVars(errorInfo.provider);
      
      if (!providerConfigured) {
        errorInfo.description = `The ${errorInfo.provider} authentication provider is missing required environment variables.`;
        errorInfo.advice = 'Please check your .env.local file and ensure all required variables are set.';
      }
    }
    
    setErrorDetails(errorInfo);
    
    // Log errors for debugging
    console.error('Auth Error:', error);
    console.error('Auth Error Details:', errorInfo);
  }, [searchParams]);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {errorDetails.title}
              </CardTitle>
              <CardDescription>
                Authentication failed - please see details below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {errorDetails.description}
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p className="font-medium flex items-center gap-1 mb-1">
                  <Info className="h-4 w-4" /> Advice:
                </p>
                <p>{errorDetails.advice}</p>
              </div>
              
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Login
                  </Link>
                </Button>
                
                <Button asChild variant="link" className="text-muted-foreground">
                  <Link href="/">Go to Homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 