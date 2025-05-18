"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, Settings, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import our tab components
import ProfileTab from '@/components/account/profile-tab';
import OrdersTab from '@/components/account/orders-tab';
import WishlistTab from '@/components/account/wishlist-tab';
import SettingsTab from '@/components/account/settings-tab';

// The main component
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}

function AccountPageContent() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { 
    isLoading: profileLoading, 
    isError, 
    error,
    needsEmail,
    refreshProfile
  } = useUserProfile();
  
  // Force refresh profile when the page loads
  useEffect(() => {
    refreshProfile();
  }, []);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Setup active tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Effect to update active tab when URL parameters change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'orders', 'wishlist', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  const loading = authLoading || profileLoading;
  
  // Try to get user data from localStorage if not available from the hook
  const ensureUserData = () => {
    if (profileLoading) return null;
    
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
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }
  
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading profile</AlertTitle>
            <AlertDescription>
              {error?.message || "Failed to load your profile data."}
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 space-y-3">
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-muted-foreground">
              Manage your account settings and view your orders
            </p>
          </div>
          
          {/* Show alert for users who need to add email */}
          {needsEmail && (
            <Alert className="mb-6 border-destructive bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">Complete your profile</AlertTitle>
              <AlertDescription>
                Please add an email address to your account.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Account Sidebar */}
            <Card className="md:col-span-1">
              <CardHeader className="py-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={userData?.avatar} alt={userData?.name} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {userData?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-2">{userData?.name || 'User'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{userData?.email || 'No email provided'}</p>
                  
                  {/* Show login method */}
                  {userData?.googleId && (
                    <span className="inline-flex items-center px-2 py-1 mt-2 text-xs rounded-full bg-blue-100 text-blue-800">
                      Google Account
                    </span>
                  )}
                  {userData?.facebookId && (
                    <span className="inline-flex items-center px-2 py-1 mt-2 text-xs rounded-full bg-blue-100 text-blue-800">
                      Facebook Account
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Button 
                  onClick={logout} 
                  variant="ghost" 
                  className="w-full rounded-none py-6 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
            
            {/* Account Content */}
            <div className="md:col-span-3">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                // Update URL when tab changes without page reload
                const url = new URL(window.location.href);
                url.searchParams.set('tab', value);
                window.history.pushState({}, '', url);
              }}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="orders">
                    <Package className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Orders</span>
                  </TabsTrigger>
                  <TabsTrigger value="wishlist">
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Wishlist</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-6">
                  <ProfileTab />
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                  <OrdersTab />
                </TabsContent>
                
                <TabsContent value="wishlist" className="mt-6">
                  <WishlistTab />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-6">
                  <SettingsTab />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 