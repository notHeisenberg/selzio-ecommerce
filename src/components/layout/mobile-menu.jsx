"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, LogIn, UserPlus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import Image from 'next/image';
import SearchBar from '@/components/search/search-bar';
import { getProducts, navItems, createSlug } from '@/data/products';
import { getCombos } from '@/data/combos';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from '@/components/theme/theme-switcher';

const MobileMenu = ({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Fetch subcategories and combos when the menu opens
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          // Fetch products to get all subcategories
          const products = await getProducts();
          const combosData = await getCombos();
          
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
          setCombos(combosData);
          
          // Initialize all categories as expanded
          const initialExpandedState = {};
          categorizedSubcategories.forEach(cat => {
            initialExpandedState[cat.category] = true;
          });
          setExpandedCategories(initialExpandedState);
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setCategories([]);
          setCombos([]);
        }
      };
      
      fetchData();
    }
  }, [isOpen]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Animation variants
  const menuVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: '0%', 
      transition: { 
        type: "tween", 
        duration: 0.3, 
        ease: "easeInOut" 
      } 
    },
    exit: { 
      x: '-100%', 
      transition: { 
        type: "tween", 
        duration: 0.2, 
        ease: "easeInOut" 
      } 
    }
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: (custom) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.1 + custom * 0.05,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  const subcategoryVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: 'auto', 
      opacity: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      } 
    }
  };
  
  useEffect(() => {
    // Add event listener to handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            ref={menuRef}
            className="absolute top-0 left-0 h-full w-full sm:w-[400px] bg-card border-r border-border shadow-xl"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking menu
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between p-4 border-b border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Link 
                  href="/" 
                  className="flex items-center"
                  onClick={onClose}
                >
                  <div className="relative h-8 w-8 mr-2">
                    <Image src="/images/logo.png" alt="Selzio Logo" fill className="object-contain" />
                  </div>
                  <span className="text-lg font-bold text-foreground dark:text-white">
                    SELZ<span className="text-rose-500">I</span>O
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
              </motion.div>

              {/* Search Bar */}
              <motion.div 
                className="p-4 border-b border-border"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SearchBar onResultClick={onClose} />
              </motion.div>

              {/* Remove auth buttons here since we'll move them to the bottom */}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Main Navigation */}
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        variants={itemVariants}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`
                            block px-4 py-3 text-lg font-medium transition-colors duration-200
                            ${pathname === item.href 
                              ? 'text-primary bg-secondary' 
                              : 'text-foreground hover:text-primary hover:bg-secondary'
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Subcategories by Category */}
                  <div className="space-y-4">
                    <motion.h3 
                      className="px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider"
                      variants={itemVariants}
                      custom={navItems.length}
                      initial="hidden"
                      animate="visible"
                    >
                      Products
                    </motion.h3>
                    {categories.map((categoryGroup, catIndex) => (
                      <motion.div 
                        key={categoryGroup.category} 
                        className="mb-2"
                        variants={itemVariants}
                        custom={navItems.length + 1 + catIndex}
                        initial="hidden"
                        animate="visible"
                      >
                        <button
                          onClick={() => toggleCategory(categoryGroup.category)}
                          className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/5 flex justify-between items-center"
                        >
                          {categoryGroup.category}
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedCategories[categoryGroup.category] ? 'rotate-90' : ''
                            }`} 
                          />
                        </button>
                        <AnimatePresence>
                          {expandedCategories[categoryGroup.category] && (
                            <motion.div
                              variants={subcategoryVariants}
                              initial="visible"
                              animate="visible"
                              exit="hidden"
                            >
                              {categoryGroup.subcategories.map((subcategory) => (
                                <Link
                                  key={subcategory.href}
                                  href={subcategory.href}
                                  onClick={onClose}
                                  className={`
                                    block px-6 py-2 text-sm transition-colors duration-200
                                    ${pathname === subcategory.href 
                                      ? 'text-primary bg-secondary' 
                                      : 'text-foreground hover:text-primary hover:bg-secondary'
                                    }
                                  `}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    
                    {/* Combos Section */}
                    {combos.length > 0 && (
                      <motion.div 
                        className="mt-4"
                        variants={itemVariants}
                        custom={navItems.length + categories.length + 1}
                        initial="hidden"
                        animate="visible"
                      >
                        <div className="px-4 py-2 text-sm font-medium text-primary bg-primary/5 mb-2">
                          Combos
                        </div>
                        <Link
                          href="/combos"
                          onClick={onClose}
                          className={`
                            block px-6 py-2 text-sm transition-colors duration-200
                            ${pathname === '/combos' 
                              ? 'text-primary bg-secondary' 
                              : 'text-foreground hover:text-primary hover:bg-secondary'
                            }
                          `}
                        >
                          All Combos
                        </Link>
                        {combos.slice(0, 5).map((combo) => (
                          <Link
                            key={combo.comboCode}
                            href={`/combos/${combo.comboCode}`}
                            onClick={onClose}
                            className={`
                              block px-6 py-2 text-sm transition-colors duration-200
                              ${pathname === `/combos/${combo.comboCode}` 
                                ? 'text-primary bg-secondary' 
                                : 'text-foreground hover:text-primary hover:bg-secondary'
                              }
                            `}
                          >
                            {combo.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Theme Switcher Section */}
                  <motion.div
                    className="border-t border-border pt-4"
                    variants={itemVariants}
                    custom={navItems.length + categories.length + (combos.length > 0 ? 2 : 1)}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Theme Settings
                    </div>
                    <div className="px-4 py-2">
                      <ThemeSwitcher isMobile={true} />
                    </div>
                  </motion.div>

                  {/* Authentication Buttons - At the bottom and only when not logged in */}
                  {!isAuthenticated && (
                    <motion.div 
                      className="border-t border-border pt-4"
                      variants={itemVariants}
                      custom={navItems.length + categories.length + (combos.length > 0 ? 3 : 2)}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="px-4 py-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Account
                      </div>
                      <div className="flex flex-col gap-2 px-4 py-2">
                        <Button 
                          className="w-full justify-start"
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
                          className="w-full justify-start"
                          onClick={() => {
                            router.push('/auth/register');
                            onClose();
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign Up
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu; 