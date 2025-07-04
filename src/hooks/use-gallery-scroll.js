"use client"

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useGalleryScroll() {
  const [scrolledPastGallery, setScrolledPastGallery] = useState(false);
  const [galleryHeight, setGalleryHeight] = useState(0);
  const pathname = usePathname();
  
  // Check if we're on a product page
  const isProductPage = pathname.includes('/products/') && pathname.split('/').length > 3;
  
  useEffect(() => {
    // If we're not on a product page, don't try to find the gallery
    if (!isProductPage) {
      return;
    }
    
    // Find the gallery element
    const galleryElement = document.querySelector('[data-gallery-container]');
    
    if (galleryElement) {
      // Get the gallery height including its position
      const updateGalleryPosition = () => {
        const rect = galleryElement.getBoundingClientRect();
        const galleryBottom = rect.bottom + window.scrollY;
        setGalleryHeight(galleryBottom);
        
        // Initial check
        handleScroll();
      };
      
      const handleScroll = () => {
        // Check if we've scrolled past the gallery
        // Adding some buffer (100px) for a smoother transition
        const scrollY = window.scrollY;
        const scrollThreshold = galleryHeight - 100;
        
        setScrolledPastGallery(scrollY > scrollThreshold);
      };
      
      // Initial setup
      updateGalleryPosition();
      
      // Update on resize
      window.addEventListener('resize', updateGalleryPosition);
      
      // Add scroll event listener
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // Cleanup
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateGalleryPosition);
      };
    }
  }, [isProductPage, galleryHeight]);
  
  // If we're not on a product page, use normal scroll behavior
  return { 
    scrolledPastGallery: isProductPage ? scrolledPastGallery : true,
    galleryHeight,
    isProductPage
  };
} 