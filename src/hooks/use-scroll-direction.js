"use client"

import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      // Only update if we've scrolled more than 10px
      if (Math.abs(scrollY - lastScrollY) > 10) {
        setScrollDirection(direction);
        // Hide navbar when scrolling down past hero section (600px), show when scrolling up
        setIsVisible(scrollY < 600 || direction === 'up');
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
  }, []);

  return { scrollDirection, scrollY, isVisible };
} 