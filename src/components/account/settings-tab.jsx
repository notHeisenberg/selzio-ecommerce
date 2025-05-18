"use client";

import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import PasswordForm from '@/components/profile/password-form';
import { Loader2 } from 'lucide-react';

export default function SettingsTab() {
  const { isSocialUser, hasPassword, refreshProfile, isLoading } = useUserProfile();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  
  // Force refresh user data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsRefreshing(true);
      await refreshProfile();
      setIsRefreshing(false);
    };
    
    loadData();
  }, []);
  
  // Determine if this is setting a new password or changing existing one
  const isSettingPassword = !hasPassword;
  
  // Combined loading state
  const loading = isLoading || isRefreshing;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Password</p>
              {loading ? (
                <Button variant="outline" size="sm" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  {isSettingPassword ? 'Set Password' : 'Change Password'}
                </Button>
              )}
              {!loading && isSocialUser && !hasPassword && (
                <p className="text-xs text-muted-foreground mt-1">
                  Setting a password will allow you to login with your email in addition to social login.
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Notification Preferences</p>
              <Button variant="outline" size="sm">
                Manage Notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                isSettingPassword ? 'Set Password' : 'Change Password'
              )}
            </DialogTitle>
            <DialogDescription>
              {loading ? (
                "Loading your account details..."
              ) : (
                isSettingPassword 
                  ? 'Set a password to enable email login'
                  : 'Change your account password'
              )}
            </DialogDescription>
          </DialogHeader>
          <PasswordForm />
        </DialogContent>
      </Dialog>
    </>
  );
} 