"use client"

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import gsap from 'gsap';

const ThemeSwitcher = ({ isMobile = false }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef(null);
  const iconRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Initial animation
  useEffect(() => {
    if (mounted) {
      gsap.fromTo(buttonRef.current,
        { 
          opacity: 0,
          scale: 0.8,
          rotation: -180
        },
        { 
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [mounted]);

  // Theme change animation
  useEffect(() => {
    if (mounted && iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: 360,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  }, [theme, mounted]);

  // Menu toggle animation
  useEffect(() => {
    if (mounted && menuRef.current) {
      if (isOpen) {
        gsap.fromTo(menuRef.current, 
          { 
            opacity: 0, 
            y: -10,
            scale: 0.95
          },
          { 
            opacity: 1, 
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: "power2.out"
          }
        );
      }
    }
  }, [isOpen, mounted]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Get the current theme icon
  const getThemeIcon = () => {
    const currentTheme = resolvedTheme;
    if (currentTheme === 'dark') {
      return <Moon className="h-5 w-5" />;
    } else if (currentTheme === 'light') {
      return <Sun className="h-5 w-5" />;
    } else {
      return <Laptop className="h-5 w-5" />;
    }
  };

  // Mobile view displays all options as buttons in a row
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 ${theme === 'light' ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 ${theme === 'dark' ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'outline'}
          size="sm"
          className={`flex-1 ${theme === 'system' ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={() => setTheme('system')}
        >
          <Laptop className="h-4 w-4 mr-2" />
          System
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="text-foreground hover:bg-secondary transition-colors duration-300 hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <div ref={iconRef} className="transform-gpu">
          {getThemeIcon()}
        </div>
      </Button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 py-2 bg-card border border-border rounded-lg shadow-lg z-50"
        >
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground mb-1">
            Select Theme
          </div>
          
          <button
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-secondary transition-colors ${
              theme === 'light' ? 'text-primary font-medium' : 'text-foreground'
            }`}
            onClick={() => { setTheme('light'); setIsOpen(false); }}
          >
            <Sun className={`h-4 w-4 mr-2 ${theme === 'light' ? 'text-primary' : 'text-foreground'}`} />
            Light
            {theme === 'light' && (
              <span className="ml-auto">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
          
          <button
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-secondary transition-colors ${
              theme === 'dark' ? 'text-primary font-medium' : 'text-foreground'
            }`}
            onClick={() => { setTheme('dark'); setIsOpen(false); }}
          >
            <Moon className={`h-4 w-4 mr-2 ${theme === 'dark' ? 'text-primary' : 'text-foreground'}`} />
            Dark
            {theme === 'dark' && (
              <span className="ml-auto">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
          
          <button
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-secondary transition-colors ${
              theme === 'system' ? 'text-primary font-medium' : 'text-foreground'
            }`}
            onClick={() => { setTheme('system'); setIsOpen(false); }}
          >
            <Laptop className={`h-4 w-4 mr-2 ${theme === 'system' ? 'text-primary' : 'text-foreground'}`} />
            System
            {theme === 'system' && (
              <span className="ml-auto">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher; 