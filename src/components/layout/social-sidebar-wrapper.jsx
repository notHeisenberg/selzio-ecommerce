'use client';

import { usePathname } from 'next/navigation';
import { SocialSidebar } from './social-sidebar';

export function SocialSidebarWrapper() {
  const pathname = usePathname();
  
  // Don't show on login and signup pages
  const excludedPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ];
  
  if (excludedPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }
  
  return <SocialSidebar />;
} 