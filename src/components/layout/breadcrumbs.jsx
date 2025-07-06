"use client"

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useGalleryScroll } from '@/hooks/use-gallery-scroll';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export function Breadcrumbs({ items = [], showHome = true, className = "" }) {
  const { scrollDirection, scrollY } = useScrollDirection({ 
    isNavbar: false, 
    thresholdPixels: 5 
  });
  const { scrolledPastGallery, isProductPage } = useGalleryScroll();
  
  // Different hiding behavior based on page type
  const shouldHide = isProductPage 
    ? scrollDirection === 'down' && scrolledPastGallery // Product page: hide when scrolling down past gallery
    : scrollDirection === 'down';                       // Other pages: hide when scrolling down

  return (
    <div 
      className={cn(
        'bg-background sticky top-0 z-30 transition-all duration-300 border-b',
        shouldHide ? '-translate-y-full' : 'translate-y-0',
        scrollY > 0 ? 'shadow-sm' : '',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3 lg:max-w-[1200px]">
        <Breadcrumb>
          <BreadcrumbList>
            {showHome && (
              <BreadcrumbItem>
                <BreadcrumbLink href="/"  className="flex justify–center items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
                {items.length > 0 && (
                  <span className="mx-2 text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </BreadcrumbItem>
            )}
            
            {items.map((item, index) => (
              <BreadcrumbItem key={index}>
                {index === items.length - 1 ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    <span className="mx-2 text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

export function generateBreadcrumbs(params, pathname, productName = null) {
  const items = [
    {
      label: "Store",
      href: "/store"
    }
  ];
  
  // Helper function to format category/subcategory names
  const formatDisplayName = (name) => {
    // First decode any URL encoded characters
    const decoded = decodeURIComponent(name);
    
    // Special case for men-s-fashion and women-s-fashion
    if (decoded.toLowerCase() === 'men-s-fashion') return "Men's Fashion";
    if (decoded.toLowerCase() === 'women-s-fashion') return "Women's Fashion";
    
    // Handle hyphenated words (convert to spaces and capitalize each word)
    return decoded.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Handle category
  if (params.category) {
    const displayCategory = formatDisplayName(params.category);
    items.push({
      label: displayCategory,
      href: `/products/${params.category}`
    });
  }
  
  // Handle subcategory and product (from slug)
  if (params.slug) {
    // If slug has length 2, it's [subcategory, productCode]
    if (params.slug.length === 2) {
      const [subcategory, productCode] = params.slug;
      const displaySubcategory = formatDisplayName(subcategory);
      
      items.push({
        label: displaySubcategory,
        href: `/products/${params.category}/${subcategory}`
      });
      
      items.push({
        label: productName || productCode,
        href: pathname
      });
    } 
    // If slug has length 1, it could be either a subcategory or product code
    else if (params.slug.length === 1) {
      const slugValue = params.slug[0];
      
      // Simple detection of product code vs subcategory
      const isLikelyProductCode = /^[A-Z]{2}-[A-Z]{4}$/.test(slugValue);
      
      if (isLikelyProductCode) {
        items.push({
          label: productName || slugValue,
          href: pathname
        });
      } else {
        // It's a subcategory
        const displaySubcategory = formatDisplayName(slugValue);
        items.push({
          label: displaySubcategory,
          href: pathname
        });
      }
    }
  }
  
  return items;
} 