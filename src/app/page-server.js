import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { Testimonials } from '@/components/home/testimonials';
import { Services } from '@/components/home/services';
import { SocialSidebar } from '@/components/layout/social-sidebar';
import { CombinedCollectionsSectionServer } from '@/components/home/combined-collections-section-server';
import { TopSellingSectionServer } from '@/components/home/top-selling-section-server';
import { getProductsCollection, getCombosCollection } from '@/lib/mongodb';

// Helper function to create URL-friendly slugs
const createSlug = (text) => {
  if (!text) return '';
  const withHyphens = text.trim().toLowerCase().replace(/\s+/g, '-');
  return withHyphens.replace(/[^a-z0-9-]+/g, '-').replace(/--+/g, '-').replace(/(^-|-$)/g, '');
};

// Default images mapping for subcategories
const defaultImages = {
  'Old Money': '/images/categories/Old_money_all.png',
  'Perfume Oils': '/images/categories/Perfume_Oils_All.jpg',
};

// Fetch homepage data on the server
async function getHomepageData() {
  try {
    const productsCollection = await getProductsCollection();
    const combosCollection = await getCombosCollection();

    // Execute all queries in parallel
    const [topSellingProducts, featuredCategoryProducts, featuredCombos] = await Promise.all([
      // Get only top 4 selling products with minimal fields
      productsCollection
        .find(
          { topSelling: true },
          {
            projection: {
              productCode: 1,
              name: 1,
              price: 1,
              originalPrice: 1,
              discount: 1,
              image: 1,
              images: 1,
              stock: 1,
              topSelling: 1,
              category: 1,
              subcategory: 1,
              featured: 1,
            },
          }
        )
        .limit(4)
        .sort({ createdAt: -1 })
        .toArray(),

      // Get products for featured categories
      productsCollection
        .find(
          {},
          {
            projection: {
              subcategory: 1,
              category: 1,
              discount: 1,
            },
          }
        )
        .limit(50)
        .toArray(),

      // Get featured combos
      combosCollection
        .find(
          { featured: true },
          {
            projection: {
              comboCode: 1,
              name: 1,
              description: 1,
              price: 1,
              originalPrice: 1,
              discount: 1,
              image: 1,
              images: 1,
              products: 1,
              featured: 1,
            },
          }
        )
        .limit(3)
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    // Build featured categories from products
    const subcategoryMap = new Map();
    featuredCategoryProducts.forEach((product) => {
      if (product.subcategory) {
        const key = product.subcategory;
        if (!subcategoryMap.has(key)) {
          subcategoryMap.set(key, {
            subcategory: product.subcategory,
            category: product.category,
            maxDiscount: product.discount || 0,
            count: 0,
          });
        } else {
          const existing = subcategoryMap.get(key);
          existing.maxDiscount = Math.max(existing.maxDiscount, product.discount || 0);
        }
        subcategoryMap.get(key).count++;
      }
    });

    const featuredCategories = Array.from(subcategoryMap.values())
      .slice(0, 2)
      .map((item, index) => {
        const categorySlug = createSlug(item.category);
        const subcatSlug = createSlug(item.subcategory);
        const image = defaultImages[item.subcategory] || '/images/categories/Old_money_all.png';

        return {
          id: index + 1,
          name: item.subcategory,
          category: item.category,
          image: image,
          count: item.count,
          description: `Shop our ${item.subcategory} collection`,
          href: `/products/${categorySlug}/${subcatSlug}`,
          discount: Math.min(Math.round(item.maxDiscount / 5) * 5, 50),
        };
      });

    // Convert MongoDB objects to plain objects
    return {
      topSellingProducts: JSON.parse(JSON.stringify(topSellingProducts)),
      featuredCategories,
      featuredCombos: JSON.parse(JSON.stringify(featuredCombos)),
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    return {
      topSellingProducts: [],
      featuredCategories: [],
      featuredCombos: [],
    };
  }
}

export default async function HomeServer() {
  // Fetch data on the server
  const { topSellingProducts, featuredCategories, featuredCombos } = await getHomepageData();

  return (
    <main className="relative">
      <Navbar />
      <SocialSidebar />
      <Hero />
      <CombinedCollectionsSectionServer
        featuredCategories={featuredCategories}
        combos={featuredCombos}
      />
      <TopSellingSectionServer topSellingProducts={topSellingProducts} />
      <Testimonials />
      <Services />
      <Footer />
    </main>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = 'force-static';
export const dynamicParams = true;

