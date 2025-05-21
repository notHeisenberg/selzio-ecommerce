"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import { getTopSellingProducts } from '@/data/products';
import { Skeleton } from '@/components/ui/skeleton';

export function TopSellingSection() {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTopSellingProducts = async () => {
      try {
        setLoading(true);
        const products = await getTopSellingProducts(4);
        setTopSellingProducts(products);
      } catch (err) {
        console.error('Failed to load top selling products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTopSellingProducts();
  }, []);

  // Skeleton loader for loading state
  const ProductSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  return (
    <section className="py-20 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Top Selling Products
          </h2>
          <p className="text-muted-foreground">
            Discover our most popular and highly-rated products
          </p>
        </div>

        {error && (
          <div className="text-center text-red-500 mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Show skeletons when loading
            Array(4).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            // Show products when loaded
            topSellingProducts.map((product, index) => (
              <ProductCard 
                key={product.productCode}
                product={product}
                index={index}
              />
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link href="/store">
            <Button variant="outline" className="px-8 transition-all duration-300 hover:shadow-md">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 