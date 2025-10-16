"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronDown } from 'lucide-react';
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
import { navItems } from '@/data/products';
import { useAuth } from '@/hooks/use-auth';
import { useAppData } from '@/providers/data-provider';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { isVisible, scrollY } = useScrollDirection({ isNavbar: true });
  const pathname = usePathname();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const iconsRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { getCategorizedSubcategories, loading: dataLoading } = useAppData();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Get categories from centralized data
  const categories = getCategorizedSubcategories();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
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
          {/* Mobile View Only */}
          <div className="md:hidden flex h-22 items-center justify-between w-full">
            {/* Left: Menu Button */}
            <div className="flex-shrink-0">
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

            {/* Center: Logo */}
            <Link 
              ref={logoRef}
              href="/" 
              className="flex items-center justify-center flex-1"
            >
              <div className="relative w-[18rem] h-[5.5rem] overflow-hidden">
                <Image 
                  src="/images/logo_new.png"
                  alt="Selzio Logo" 
                  fill 
                  sizes="20000px" 
                  className="object-cover transition-all duration-300"
                  style={{
                    filter: mounted && resolvedTheme === 'light' 
                      ? 'invert(1) hue-rotate(180deg) saturate(3.5)' 
                      : 'none'
                  }}
                  quality={100}
                  priority
                />
              </div>
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && <UserMenu />}
              <CartDrawer />
            </div>
          </div>

          {/* Tablet & Desktop View */}
          <div className="hidden md:block">
            {/* Top Row - Logo, Navigation Items, Icons */}
            <div className="flex h-20 items-center justify-between w-full">
              {/* Logo */}
              <Link 
                href="/" 
                className="flex items-center flex-shrink-0 mr-4"
              >
                <div className="relative h-[5.5rem] w-[20rem] overflow-hidden">
                  <Image 
                    src="/images/logo_new.png"
                    alt="Selzio Logo" 
                    fill 
                    sizes="20000px" 
                    className="object-cover transition-all duration-300"
                    style={{
                      filter: mounted && resolvedTheme === 'light' 
                        ? 'invert(1) hue-rotate(180deg) saturate(3.5)' 
                        : 'none'
                    }}
                    quality={100}
                    priority
                  />
                </div>
              </Link>

              {/* Navigation Items - Centered */}
              <div ref={navRef} className="flex items-center space-x-4 lg:space-x-6 flex-1 justify-center">
                {navItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    onMouseEnter={handleNavHover}
                    onMouseLeave={handleNavLeave}
                    className={cn(
                      "relative text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap",
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
                  className="relative z-[200]"
                >
                  <button 
                    onMouseEnter={handleNavHover}
                    onMouseLeave={handleNavLeave}
                    className={cn(
                      "flex items-center text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap",
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
                      "absolute top-full left-0 w-72 bg-card border border-border rounded-md shadow-lg transition-all duration-300 max-h-[80vh] overflow-y-auto z-[100]",
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

              {/* Icons Section */}
              <div ref={iconsRef} className="flex items-center gap-3 flex-shrink-0">
                <UserMenu />
                <CartDrawer />
                <ThemeSwitcher />
              </div>
            </div>

            {/* Bottom Row - Search Bar (Full Width) */}
            <div ref={searchRef} className="pb-4">
              <SearchBar />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Empty div with navbar's height to prevent content from hiding under fixed navbar */}
      <div className="h-16 md:h-[136px]"></div>
    </>
  );
} 