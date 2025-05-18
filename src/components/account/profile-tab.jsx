"use client";

import { useState } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditProfileForm from '@/components/profile/edit-profile-form';

export default function ProfileTab() {
  const { user, refetch } = useUserProfile();
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Handle profile update success
  const handleProfileUpdate = () => {
    setEditProfileOpen(false);
    refetch(); // Refresh user data
  };

  // Try to get user data from localStorage if not available from the hook
  const ensureUserData = () => {
    if (user) return user;
    
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        return JSON.parse(storedUserData);
      }
    } catch (error) {
      console.error('Error getting stored user data:', error);
    }
    
    return null;
  };
  
  // Get the user data or fallback to localStorage
  const userData = ensureUserData();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            View and update your profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Full Name</p>
              <p className="text-muted-foreground">{userData?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Email</p>
              <p className="text-muted-foreground">
                {userData?.email || (
                  <span className="text-destructive">Not provided - Please add an email</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Phone</p>
              <p className="text-muted-foreground">{userData?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Address</p>
              <p className="text-muted-foreground">{userData?.address || 'Not provided'}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setEditProfileOpen(true)}
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          <EditProfileForm onSuccess={handleProfileUpdate} />
        </DialogContent>
      </Dialog>
    </>
  );
} 