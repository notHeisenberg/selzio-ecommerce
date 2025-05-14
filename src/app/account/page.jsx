"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Heart, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);
  
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Account Sidebar */}
            <Card className="md:col-span-1">
              <CardHeader className="py-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-2">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-2">{user?.name || 'User'}</CardTitle>
                  <CardDescription>{user?.email || ''}</CardDescription>
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
              <Tabs defaultValue="profile">
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
                          <p className="text-muted-foreground">{user?.name || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Email</p>
                          <p className="text-muted-foreground">{user?.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Phone</p>
                          <p className="text-muted-foreground">{user?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Address</p>
                          <p className="text-muted-foreground">{user?.address || 'Not provided'}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        View your recent orders and their status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No orders found</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="wishlist" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Wishlist</CardTitle>
                      <CardDescription>
                        Products you've saved for later
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6">
                        <Heart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Your wishlist is empty</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-6">
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
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
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