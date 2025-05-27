"use client"

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFeaturedCategories } from '@/data/products';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function CategoriesSection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subcategories = await getFeaturedCategories();
        setFeaturedCategories(subcategories);
      } catch (error) {
        console.error('Failed to fetch featured subcategories:', error);
        setFeaturedCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubcategories();
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Shop by Category
          </h2>
          <p className="text-muted-foreground">
            Browse our curated collection of premium products across popular categories
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {loading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse w-full max-w-sm md:max-w-[calc(50%-1rem)] lg:max-w-[calc(25%-1.5rem)]">
                <div className="rounded-2xl h-64 bg-secondary/70"></div>
              </div>
            ))
          ) : (
            // Actual categories
            featuredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group w-full max-w-sm md:max-w-[calc(50%-1rem)] lg:max-w-[calc(25%-1.5rem)]"
              >
                <Link href={category.href}>
                  <div className={`relative overflow-hidden rounded-2xl h-64 transition-all duration-500 
                    ${mounted && resolvedTheme === 'dark'
                      ? 'bg-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.25)] group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]'
                      : 'bg-card shadow-[0_8px_30px_rgba(100,116,139,0.08)] group-hover:shadow-[0_15px_35px_rgba(100,116,139,0.12)]'
                    }`}>
                    
                    {/* Category Image */}
                    <div className="absolute inset-0 overflow-hidden">
                      <Image 
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 
                        ${mounted && resolvedTheme === 'dark'
                          ? 'bg-gradient-to-t from-black/80 via-black/40 to-black/10'
                          : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
                        }`}></div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className={`transition-all duration-300 transform group-hover:translate-y-[-4px]`}>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {category.name}
                        </h3>
                        <div className={`flex items-center text-sm ${
                          mounted && resolvedTheme === 'dark' 
                            ? 'text-blue-200/90'
                            : 'text-white/80'
                        }`}>
                          <span>Shop Now</span>
                          <div className={`ml-1 flex items-center justify-center rounded-full w-5 h-5 
                            ${mounted && resolvedTheme === 'dark'
                              ? 'bg-blue-900/40 transition-all duration-300 group-hover:bg-blue-800/60'
                              : 'bg-white/20 transition-all duration-300 group-hover:bg-white/30'
                            }`}>
                            <ArrowRight className="h-3 w-3 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
} 