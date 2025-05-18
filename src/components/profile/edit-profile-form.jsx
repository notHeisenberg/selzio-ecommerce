"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, X } from 'lucide-react';

// Define form schema with validation
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function EditProfileForm({ onSuccess }) {
  const { toast } = useToast();
  const { api } = useAuth(); // Get API from auth hook
  const [serverError, setServerError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  
  // Use the user profile hook instead of directly using auth
  const { user, updateProfile, needsEmail, refreshProfile } = useUserProfile();
  
  // Initialize form with user data
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });
  
  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user, form]);

  // Set initial avatar preview
  useEffect(() => {
    if (user?.avatar) {
      setPhotoPreview(user.avatar);
    }
  }, [user]);
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
      });
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image should be less than 2MB",
      });
      return;
    }
    
    // Create local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Upload image to server
    await uploadPhotoToServer(file);
  };
  
    // Upload photo to server
  const uploadPhotoToServer = async (file) => {
    setUploadingPhoto(true);
    
    try {
      // 1. First upload to Cloudinary
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/api/cloudinary/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.avatarUrl) {
        try {
          // Update the user profile with the new avatar URL
          await updateProfile.mutateAsync({
            avatar: response.data.avatarUrl
          });
          
          // Simply refresh the profile data to update UI
          await refreshProfile();
          
          // Show success toast AFTER all operations complete
          toast({
            variant: "success",
            title: "Photo updated!",
            description: "Your profile photo has been updated.",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: "Failed to update profile with new avatar.",
          });
        }
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload photo';
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
      
      // Revert to previous avatar if upload fails
      setPhotoPreview(user?.avatar || null);
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Handle photo removal
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  async function onSubmit(values) {
    setServerError('');
    
    try {
      // Use the mutation from useUserProfile
      await updateProfile.mutateAsync(values);
      
      // Show success message
      toast({
        variant: "success",
        title: "Profile updated!",
        description: "Your profile information has been updated.",
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setServerError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {serverError}
          </div>
        )}
        
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-24 w-24 cursor-pointer relative group" 
            onClick={() => fileInputRef.current?.click()}>
            <AvatarImage src={photoPreview} alt="Profile photo" />
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
            
            {/* Overlay for upload indicator */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </Avatar>
          
          {/* Photo upload buttons */}
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Change Photo'
              )}
            </Button>
            
            {photoPreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Upload a profile photo (Max: 2MB)
          </p>
        </div>
        
        {/* Name field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address {needsEmail && <span className="text-destructive">*</span>}</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Your email address" />
              </FormControl>
              {needsEmail && (
                <p className="text-sm text-muted-foreground">
                  You need to add an email to your account.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Phone field */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="tel" placeholder="Your phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Address field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Your shipping address" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={updateProfile.isPending || uploadingPhoto}>
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>
    </Form>
  );
} 