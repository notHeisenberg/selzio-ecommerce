"use client"

import { useState } from 'react';
import { User, LogOut, Settings, Heart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You've been logged out successfully."
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="hidden md:flex text-foreground hover:text-primary hover:bg-secondary transition-colors duration-300"
          onClick={() => router.push('/auth/login')}
        >
          Login
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="hidden md:flex"
          onClick={() => router.push('/auth/register')}
        >
          Sign Up
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:text-primary hover:bg-secondary transition-colors duration-300"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className="focus:bg-secondary focus:text-foreground">
          <Link href="/account?tab=profile" className="cursor-pointer text-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>My Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-secondary focus:text-foreground">
          <Link href="/account?tab=orders" className="cursor-pointer text-foreground">
            <Package className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-secondary focus:text-foreground">
          <Link href="/account?tab=wishlist" className="cursor-pointer text-foreground">
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="focus:bg-secondary focus:text-foreground">
          <Link href="/account?tab=settings" className="cursor-pointer text-foreground">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu; 