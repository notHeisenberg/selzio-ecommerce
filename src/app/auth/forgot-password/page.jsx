"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  );
} 