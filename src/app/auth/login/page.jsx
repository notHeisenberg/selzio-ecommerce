"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialLogin from '@/components/auth/social-login';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setServerError('');
    
    try {
      // Log the login attempt for debugging
      console.log('Attempting to login:', { email: values.email });
      
      // Call the login function from our auth hook
      await login(values.email, values.password);
      
      // Show success toast
      toast({
        variant: "success",
        title: "Login successful!",
        description: "Welcome back to Selzio.",
        action: (
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        )
      });
      
      // Redirect to home page or dashboard after successful login
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with an error status
        const errorMessage = error.response.data?.error || 'Login failed. Please try again.';
        setServerError(errorMessage);
        
        // Set form errors for specific cases
        if (errorMessage.includes('Invalid credentials')) {
          form.setError('email', { 
            type: 'manual', 
            message: 'Email or password is incorrect' 
          });
          form.setError('password', { 
            type: 'manual', 
            message: 'Email or password is incorrect' 
          });
        }
      } else if (error.request) {
        // The request was made but no response was received
        setServerError('Network error. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request
        setServerError('An unexpected error occurred. Please try again later.');
      }

      // Show error toast
      toast({
        variant: "destructive",
        title: "Login failed",
        description: serverError || 'There was a problem signing in to your account.',
        action: (
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        )
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle successful social login
  const handleSocialLoginSuccess = () => {
    toast({
      variant: "success",
      title: "Login successful!",
      description: "Welcome back to Selzio.",
    });
    
    // NextAuth will handle the redirect
  };

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-10 mr-2">
            <Image src="/logo.png" alt="Selzio Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold text-foreground dark:text-white">
            SELZ<span className="text-primary">I</span>O
          </span>
        </Link>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>
        
        {serverError && (
          <div className="p-3 bg-destructive/15 border border-destructive text-destructive rounded-md text-sm">
            {serverError}
          </div>
        )}
        
        <SocialLogin 
          onSuccess={handleSocialLoginSuccess} 
          redirectUrl="/"
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email" 
                      placeholder="name@example.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary underline underline-offset-4 hover:text-primary/90">
              Sign up
            </Link>
          </p>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-primary underline underline-offset-4 hover:text-primary/90"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
} 