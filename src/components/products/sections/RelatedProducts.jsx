"use client"

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getRelatedProducts } from '@/data/products';
import { ProductCard } from '@/components/products/product-card';

export default function RelatedProducts({ productCode, limit = 4 }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productCode) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const relatedItems = await getRelatedProducts(productCode, limit);
        setRelatedProducts(relatedItems);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productCode, limit]);

  if (loading) {
    return (
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-5 w-3/4 rounded-none" />
                  <Skeleton className="h-4 w-1/2 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 bg-secondary/5">
      <div className="container px-4 md:px-6 lg:max-w-[1200px]">
        <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product, index) => (
            <div key={product.productCode} className="group">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 