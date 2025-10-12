"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values) {
    try {
      setIsLoading(true);
      
      // In a real app, you would send a request to your API to handle the password reset
      // For now, we'll just simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col items-center justify-center p-4 gap-8">
      {/* Logo Section */}
      <div className="flex justify-center">
        <Link href="/" className="flex items-center h-16 justify-center">
          <div className="relative h-72 w-80">
            <Image 
              src="/images/logo_new.png" 
              alt="Selzio Logo" 
              fill 
              sizes="320px"
              className="object-contain w-full h-full transition-all duration-300"
              style={{
                filter: mounted && resolvedTheme === 'light' 
                  ? 'invert(1) hue-rotate(180deg) saturate(3.5)' 
                  : 'none'
              }}
              quality={100}
            />
          </div>
        </Link>
      </div>
      
      {/* Form Section */}
      <div className="w-full max-w-md bg-background border border-border shadow-lg p-8 rounded-none">
        <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-primary">
                If an account exists with the email you provided, we've sent instructions to reset your password.
              </p>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/auth/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
        ) : (
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
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => router.push('/auth/login')}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to login
                </Button>
              </div>
            </form>
          </Form>
        )}
        </div>
      </div>
    </div>
  );
} 