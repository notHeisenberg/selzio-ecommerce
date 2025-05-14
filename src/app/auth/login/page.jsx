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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values) {
    try {
      setIsLoading(true);
      await login(values.email, values.password);
      // Redirect to home page or dashboard after successful login
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
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
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
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