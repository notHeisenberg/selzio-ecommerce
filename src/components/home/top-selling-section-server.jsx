"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/product-card';
import { ArrowRight } from 'lucide-react';

export function TopSellingSectionServer({ topSellingProducts = [] }) {
  if (topSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-5 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-start mx-auto">
          <h2 className="text-xl font-medium mb-7 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
            Top Selling Products
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {topSellingProducts.map((product, index) => (
            <ProductCard
              key={product.productCode}
              product={product}
              index={index}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild className="bg-transparent text-gray-800 dark:text-white hover:bg-slate-800/10 dark:hover:bg-gray-800/10 border border-gray-800 dark:border-white rounded-none py-6 px-16">
            <Link href="/store">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

