"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import Image from 'next/image';
import SearchBar from '@/components/search/search-bar';
import { getProducts, navItems, createSlug } from '@/data/products';
import { useAuth } from '@/hooks/use-auth';

const MobileMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  
  // Fetch subcategories when the menu opens
  useEffect(() => {
    if (isOpen) {
      const fetchSubcategories = async () => {
        try {
          // Fetch products to get all subcategories
          const products = await getProducts();
          
          // Group subcategories by category
          const subcategoriesByCategory = {};
          
          products.forEach(product => {
            if (product.category) {
              // Normalize category name
              const categoryName = product.category.trim();
              
              // Ensure subcategory exists and is not empty
              if (product.subcategory) {
                // Normalize subcategory name
                const subcategoryName = product.subcategory.trim();
                
                if (subcategoryName) {
                  if (!subcategoriesByCategory[categoryName]) {
                    subcategoriesByCategory[categoryName] = new Set();
                  }
                  subcategoriesByCategory[categoryName].add(subcategoryName);
                }
              }
            }
          });
          
          // Convert to the format needed for the dropdown
          const categorizedSubcategories = Object.entries(subcategoriesByCategory).map(([category, subcategories]) => ({
            category,
            subcategories: Array.from(subcategories).map(subcategory => ({
              name: subcategory,
              href: `/products/${createSlug(category)}/${createSlug(subcategory)}`
            }))
          }));
          
          // Sort categories alphabetically
          categorizedSubcategories.sort((a, b) => a.category.localeCompare(b.category));
          
          // For each category, sort subcategories alphabetically
          categorizedSubcategories.forEach(category => {
            category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
          });
          
          setCategories(categorizedSubcategories);
        } catch (error) {
          console.error('Failed to fetch subcategories:', error);
          setCategories([]);
        }
      };
      
      fetchSubcategories();
    }
  }, [isOpen]);
  
  useEffect(() => {
    // Add event listener to handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // Menu animation
      gsap.fromTo(menuRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.3, ease: "power2.out" }
      );
      
      // Items animation
      gsap.fromTo('.menu-item',
        { x: 20, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.4, 
          stagger: 0.05,
          delay: 0.2,
          ease: "power2.out" 
        }
      );
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50"
      onClick={onClose}
    >
      <div 
        ref={menuRef}
        className="absolute top-0 right-0 h-full w-[300px] bg-card border-l border-border shadow-xl"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking menu
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link 
              href="/" 
              className="flex items-center"
              onClick={onClose}
            >
              <div className="relative h-8 w-8 mr-2">
                <Image src="/logo.png" alt="Selzio Logo" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold text-foreground dark:text-white">
                SELZ<span className="text-primary">I</span>O
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-primary hover:bg-secondary"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-border">
            <SearchBar />
          </div>

          {/* Authentication Buttons - Only when not logged in */}
          {!isAuthenticated && (
            <div className="p-4 flex flex-col gap-2 border-b border-border">
              <Button 
                className="menu-item w-full justify-start"
                variant="outline"
                onClick={() => {
                  router.push('/auth/login');
                  onClose();
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button 
                className="menu-item w-full justify-start"
                onClick={() => {
                  router.push('/auth/register');
                  onClose();
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`
                      menu-item block px-4 py-2 text-lg font-medium rounded-lg transition-colors duration-200
                      ${pathname === item.href 
                        ? 'text-primary bg-secondary' 
                        : 'text-foreground hover:text-primary hover:bg-secondary'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Subcategories by Category */}
              <div className="space-y-4">
                <h3 className="px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Products
                </h3>
                {categories.map((categoryGroup) => (
                  <div key={categoryGroup.category} className="mb-2 space-y-1">
                    <div className="px-4 py-1 text-sm font-medium text-primary bg-primary/5 rounded-lg">
                      {categoryGroup.category}
                    </div>
                    {categoryGroup.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.href}
                        href={subcategory.href}
                        onClick={onClose}
                        className={`
                          menu-item block px-6 py-1.5 text-sm rounded-lg transition-colors duration-200
                          ${pathname === subcategory.href 
                            ? 'text-primary bg-secondary' 
                            : 'text-foreground hover:text-primary hover:bg-secondary'
                          }
                        `}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu; 