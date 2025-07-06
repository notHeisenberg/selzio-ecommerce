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
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialLogin from '@/components/auth/social-login';
import { motion } from 'framer-motion';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-10"
      >
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-10 mr-2">
            <Image src="/images/logo.png" alt="Selzio Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-bold text-foreground dark:text-white">
            SELZ<span className="text-rose-500">I</span>O
          </span>
        </Link>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-background border border-border shadow-lg p-8 rounded-none"
      >
        <motion.div variants={itemVariants} className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </motion.div>
        
        {serverError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-destructive/15 border border-destructive text-destructive mb-6 text-sm"
          >
            {serverError}
          </motion.div>
        )}
        
        <motion.div variants={itemVariants}>
          <SocialLogin 
            onSuccess={handleSocialLoginSuccess} 
            redirectUrl="/"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </motion.div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input
                          type="email" 
                          placeholder="name@example.com" 
                          className="pl-10 py-6 bg-secondary/30 border-border focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-foreground/80">Password</FormLabel>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10 py-6 bg-secondary/30 border-border focus:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            
            <motion.div variants={itemVariants} className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-6 bg-primary hover:bg-primary/90 text-white dark:text-black font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
        
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 