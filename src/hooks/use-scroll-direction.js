"use client"

import { useState, useEffect } from 'react';

export function useScrollDirection(options = {}) {
  const { 
    initialDirection = 'up',
    thresholdPixels = 10,
    hideThreshold = 600,
    isNavbar = true // Flag to determine if this is for navbar or breadcrumbs
  } = options;
  
  const [scrollDirection, setScrollDirection] = useState(initialDirection);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      // Only update if we've scrolled more than threshold pixels
      if (Math.abs(scrollY - lastScrollY) > thresholdPixels) {
        setScrollDirection(direction);
        
        // Different visibility logic for navbar vs breadcrumbs
        if (isNavbar) {
          // Original behavior: Hide navbar when scrolling down past hero section, show when scrolling up
          setIsVisible(scrollY < hideThreshold || direction === 'up');
        } else {
          // Breadcrumbs: Hide when scrolling down, show when scrolling up
          setIsVisible(direction === 'up');
        }
      }
      
      setScrollY(scrollY);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [thresholdPixels, hideThreshold, isNavbar]);

  return { scrollDirection, scrollY, isVisible };
} 