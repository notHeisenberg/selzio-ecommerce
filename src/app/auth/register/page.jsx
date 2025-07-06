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
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialLogin from '@/components/auth/social-login';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    setServerError('');
    
    try {
 
      // Call the register function from our auth hook
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      
      // Show success toast
      toast({
        title: "Registration successful!",
        description: "Your account has been created. You can now log in.",
      });
      
      // Redirect to login page after successful registration
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.response) {
        // The request was made and the server responded with an error status
        const errorMessage = error.response.data?.error || 'Registration failed. Please try again.';
        setServerError(errorMessage);
        
        // If there's a duplicate email error
        if (errorMessage.includes('already exists')) {
          form.setError('email', { 
            type: 'manual', 
            message: 'This email is already registered. Please use a different email or try logging in.' 
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
        title: "Registration failed",
        description: serverError || 'There was a problem creating your account.',
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
      description: "Welcome to Selzio!",
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
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join Selzio to start shopping</p>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Full Name</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input
                          placeholder="John Doe"
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
                    <FormLabel className="text-foreground/80">Password</FormLabel>
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
            
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Confirm Password</FormLabel>
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
                    Creating account...
                  </>
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
        
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
} 