"use client"

import { useState, useEffect } from 'react';
import { getFeaturedCombos } from '@/data/combos';
import { ComboCard } from './combo-card';

export function CombosSection() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Fetch featured combos
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const featuredCombos = await getFeaturedCombos();
        setCombos(featuredCombos);
      } catch (error) {
        console.error('Failed to fetch featured combos:', error);
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCombos();
  }, []);

  // If there are no combos, don't render the section
  if (!loading && (!combos || combos.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-start">
          <h2 className="text-xl font-medium mb-7 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Special Combos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="rounded-md h-80 bg-secondary/70"></div>
              </div>
            ))
          ) : (
            // Actual combos
            combos.map((combo, index) => (
              <ComboCard key={combo.comboCode} combo={combo} index={index} />
            ))
          )}
        </div>
      </div>
    </section>
  );
} 