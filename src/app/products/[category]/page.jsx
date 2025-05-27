"use client"

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Folder } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { generateBreadcrumbs } from '@/components/layout/breadcrumbs';

export default function CategoryPage() {
  const params = useParams();
  const { category } = params;

  // Helper function to normalize category names (handle hyphens and apostrophes)
  const normalizeCategory = (cat) => {
    if (!cat) return '';
    
    // Special cases for fashion categories
    if (cat.toLowerCase() === 'men-s-fashion') return "men's fashion";
    if (cat.toLowerCase() === 'women-s-fashion') return "women's fashion";
    
    // Regular normalization
    return cat.toLowerCase();
  };

  // Sample subcategories by category
  const sampleSubcategories = {
    electronics: ['Audio', 'Computers', 'Accessories', 'TVs', 'Smart Home'],
    fashion: ['Clothing', 'Accessories', 'Footwear', 'Bags', 'Jewelry'],
    'home-living': ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Bath'],
    beauty: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Personal Care'],
    "men's fashion": ['Shirts', 'Pants', 'Casual wear', 'Accessories', 'Shoes'],
    "women's fashion": ['Dresses', 'Tops', 'Bottoms', 'Accessories', 'Footwear']
  };

  // Get normalized category name for lookup
  const normalizedCategory = normalizeCategory(category);
  
  // Debug logs
  console.log('Original category from URL:', category);
  console.log('Normalized category:', normalizedCategory);
  console.log('Available categories:', Object.keys(sampleSubcategories));

  // Find subcategories for this category
  const subcategories = sampleSubcategories[normalizedCategory] || [];

  // Format category for display
  let displayCategory;
  if (normalizedCategory === "men's fashion") {
    displayCategory = "Men's Fashion";
  } else if (normalizedCategory === "women's fashion") {
    displayCategory = "Women's Fashion";
  } else {
    displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: "Store", href: "/store" },
    { label: displayCategory, href: `/products/${category}` }
  ];

  return (
    <>
      <PageHeader breadcrumbItems={breadcrumbItems} />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">
          {displayCategory}
        </h2>
        <p className="text-muted-foreground mb-8">
          Browse subcategories in our {displayCategory} collection.
        </p>

        {subcategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory}
                href={`/products/${category}/${encodeURIComponent(subcategory.toLowerCase())}`}
                className="border rounded-lg p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <span className="font-medium">{subcategory}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-4 mb-8">
            <p>No subcategories found for {displayCategory}.</p>
          </div>
        )}

        <Link href="/store">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Button>
        </Link>
      </div>
    </>
  );
} 