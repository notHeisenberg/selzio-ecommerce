"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PasswordForm() {
  const { user, isSocialUser, hasPassword, updatePassword, refreshProfile, isLoading } = useUserProfile();
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(true);
  
  // Refresh user data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsRefreshing(true);
      await refreshProfile();
      setIsRefreshing(false);
    };
    
    loadData();
  }, []); // Empty dependency array to run only on mount
  
  // Combined loading state
  const loading = isLoading || isRefreshing;
  
  // Define schema based on whether user has an existing password
  const passwordSchema = hasPassword
    ? z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      })
    : z.object({
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

  // Initialize form
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  
  // Reset form when user or hasPassword changes
  useEffect(() => {
    if (!loading) {
      form.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, hasPassword, form, loading]);
  
  async function onSubmit(values) {
    setServerError('');
    
    try {
      // Remove confirmPassword as it's only used for validation
      const { confirmPassword, ...passwordData } = values;
      
      // Set refreshing state
      setIsRefreshing(true);
      
      // Use the mutation from useUserProfile
      await updatePassword.mutateAsync(passwordData);
      
      // Force refresh user data to get updated hasPassword status
      await refreshProfile();
      
      // Show success message
      toast({
        variant: "success",
        title: hasPassword ? "Password updated!" : "Password set!",
        description: hasPassword 
          ? "Your password has been changed successfully."
          : "You can now use your password to log in.",
      });
      
      // Reset form
      form.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update password';
      setServerError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
    } finally {
      setIsRefreshing(false);
    }
  }
  
  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {isSocialUser && !hasPassword && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Social Login Account</AlertTitle>
          <AlertDescription>
            You signed up with a social account. Setting a password will let you log in with your email as well.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {serverError}
            </div>
          )}
          
          {/* Current Password - Only for users who already have a password */}
          {hasPassword && (
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Your current password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{hasPassword ? 'New Password' : 'Set Password'}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Choose a secure password" />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm your password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={updatePassword.isPending || isRefreshing}>
            {updatePassword.isPending || isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasPassword ? 'Updating Password...' : 'Setting Password...'}
              </>
            ) : (
              hasPassword ? 'Change Password' : 'Set Password'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 