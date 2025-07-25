"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown, LogIn, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import SearchBar from '@/components/search/search-bar';
import UserMenu from '@/components/user/user-menu';
import CartDrawer from '@/components/cart/cart-drawer';
import ThemeSwitcher from '@/components/theme/theme-switcher';
import MobileMenu from './mobile-menu';
import { getProducts, navItems, createSlug } from '@/data/products';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { isVisible, scrollY } = useScrollDirection({ isNavbar: true });
  const pathname = usePathname();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const iconsRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);

  // Fetch subcategories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
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
    
    fetchCategories();
  }, []);

  useEffect(() => {
    // Logo animation
    gsap.fromTo(logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Nav items animation
    gsap.fromTo(navRef.current?.children,
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Search bar animation
    gsap.fromTo(searchRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
    );

    // Icons animation
    gsap.fromTo(iconsRef.current?.children,
      { opacity: 0, x: 20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8, 
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.6
      }
    );
  }, []);

  // Animate nav items on hover - avoiding potential GSAP CSS variable issues
  const handleNavHover = (e) => {
    if (e.target) {
      gsap.to(e.target, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleNavLeave = (e) => {
    if (e.target) {
      gsap.to(e.target, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <>
      <nav
        className={cn(
          'border-b fixed w-full bg-background/90 backdrop-blur-md z-40 transition-all duration-300',
          !isVisible ? '-translate-y-full' : 'translate-y-0',
          scrollY > 0 ? 'shadow-sm' : ''
        )}
      >
        <div className="container mx-auto px-4 lg:max-w-[1200px]">
          {/* Top Row - Logo, Navigation, Icons */}
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Mobile Menu Button - Only visible on mobile, now on left side */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-primary hover:bg-secondary transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            {/* Logo - Centered on mobile */}
            <Link 
              ref={logoRef}
              href="/" 
              className="flex items-center md:order-first order-none ml-10"
            >
              <div className="relative h-8 w-8 md:h-10 md:w-10 mr-2">
                <Image 
                  src="/images/logo.png" 
                  alt="Selzio Logo" 
                  fill 
                  sizes="(max-width: 768px) 32px, 40px" 
                  className="object-contain" 
                />
              </div>
              <span className="text-lg md:text-xl font-bold text-foreground dark:text-white mr-2">
                SELZ<span className="text-rose-500">I</span>O
              </span>
            </Link>

            {/* Navigation Items */}
            <div ref={navRef} className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onMouseEnter={handleNavHover}
                  onMouseLeave={handleNavLeave}
                  className={cn(
                    "relative text-muted-foreground hover:text-foreground transition-colors duration-300",
                    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300",
                    "hover:after:w-full",
                    pathname === item.href && "text-foreground after:w-full"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Categories Dropdown */}
              <div
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
                className="relative"
              >
                <button 
                  onMouseEnter={handleNavHover}
                  onMouseLeave={handleNavLeave}
                  className={cn(
                    "flex items-center text-muted-foreground hover:text-foreground transition-colors duration-300",
                    "relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300",
                    "hover:after:w-full",
                    pathname.startsWith('/products') && "text-foreground after:w-full"
                  )}
                >
                  Products
                  <ChevronDown className={cn(
                    "ml-1 h-4 w-4 transition-transform duration-300",
                    isCategoryOpen && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Content */}
                <div
                  className={cn(
                    "absolute top-full left-0 w-72 bg-card border border-border rounded-md shadow-lg transition-all duration-300 max-h-[80vh] overflow-y-auto",
                    "opacity-0 invisible translate-y-2",
                    isCategoryOpen && "opacity-100 visible translate-y-0"
                  )}
                >
                  <div className="py-2">
                    {categories.map((categoryGroup) => (
                      <div key={categoryGroup.category} className="mb-2">
                        <div className="px-4 py-1 font-medium text-sm text-primary bg-primary/5">
                          {categoryGroup.category}
                        </div>
                        <div>
                          {categoryGroup.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.href}
                              href={subcategory.href}
                              onMouseEnter={handleNavHover}
                              onMouseLeave={handleNavLeave}
                              className={cn(
                                "block px-6 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-300",
                                "relative overflow-hidden",
                                "before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-0 before:bg-primary before:transition-all before:duration-700 before:ease-out",
                                "hover:before:w-full",
                                pathname === subcategory.href && "text-foreground bg-secondary font-medium before:w-full"
                              )}
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Only visible on large screens */}
            <div ref={searchRef} className="hidden lg:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* Icons Section */}
            <div ref={iconsRef} className="flex items-center gap-2 md:gap-4">
              <UserMenu />
              <CartDrawer />
              {/* Search icon on small screens, ThemeSwitcher on larger screens */}
              <div className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-foreground hover:text-primary hover:bg-secondary transition-colors duration-300"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
              <div className="hidden md:block">
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          {/* Search Bar Row - Only visible on medium screens */}
          <div className="lg:hidden md:block hidden pb-4">
            <SearchBar />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Search</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SearchBar onResultClick={() => setIsSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty div with navbar's height to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
} 