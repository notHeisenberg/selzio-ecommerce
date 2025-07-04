"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ComboCard } from '@/components/home/combo-card';
import { getCombos } from '@/data/combos';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [filteredCombos, setFilteredCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Store", href: "/store" },
    { label: "Combos", href: "/combos" }
  ];

  // Load combos data
  useEffect(() => {
    const loadCombos = async () => {
      try {
        setLoading(true);
        const combosData = await getCombos();
        setCombos(combosData);
        setFilteredCombos(combosData);
      } catch (err) {
        console.error('Failed to load combos:', err);
        setError('Failed to load combos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCombos();
  }, []);

  // Filter combos based on search query
  useEffect(() => {
    if (combos.length === 0) return;

    if (searchQuery.trim() === '') {
      setFilteredCombos(combos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = combos.filter(combo => 
      combo.name.toLowerCase().includes(query) || 
      (combo.description && combo.description.toLowerCase().includes(query))
    );

    setFilteredCombos(filtered);
  }, [searchQuery, combos]);

  return (
    <>
      <PageHeader breadcrumbItems={breadcrumbItems} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Special Combos</h1>
        <p className="text-muted-foreground mb-8">
          Discover our special combo offers with premium value.
        </p>

        {/* Search bar */}
        <div className="mb-8 relative max-w-md">
          <Input
            type="search"
            placeholder="Search combos..."
            className="pl-10 rounded-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>

        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="animate-pulse">
                <div className="bg-secondary/70 h-[300px] rounded-none"></div>
                <div className="bg-secondary/70 h-6 w-3/4 mt-4 rounded-none"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="py-12 text-center border rounded-none">
            <h3 className="text-xl font-medium mb-2">Error loading combos</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        ) : filteredCombos.length > 0 ? (
          // Combos grid
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCombos.map((combo, index) => (
              <ComboCard key={combo.comboCode} combo={combo} index={index} />
            ))}
          </div>
        ) : (
          // No combos found
          <div className="py-12 text-center border rounded-none">
            <h3 className="text-xl font-medium mb-2">No combos found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Check back later for new combo offers'}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/store">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
} 