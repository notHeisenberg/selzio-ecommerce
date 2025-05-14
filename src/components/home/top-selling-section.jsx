"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTopSellingProducts } from '@/data/products';
import { ProductCard } from '@/components/products/product-card';

export function TopSellingSection() {
  const topSellingProducts = getTopSellingProducts();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {topSellingProducts.map((product, index) => (
            <ProductCard 
              key={product.id}
              product={product}
              index={index}
            />
          ))}
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