// Comprehensive products array containing all product information
export const products = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 199.99,
    rating: 4.8,
    reviews: 128,
    image: '/products/headphones.jpg',
    category: 'Electronics',
    subcategory: 'Audio',
    discount: 15,
    description: 'Experience superior sound quality with our premium wireless headphones featuring noise-cancellation technology.',
    topSelling: true,
    stock: 35,
    tags: ['wireless', 'audio', 'premium', 'noise-cancelling']
  },
  {
    id: 2,
    name: 'Designer Watch Collection',
    price: 299.99,
    rating: 4.9,
    reviews: 89,
    image: '/products/watch.jpg',
    category: 'Fashion',
    subcategory: 'Accessories',
    discount: 10,
    description: 'Elegant timepieces crafted with precision for the modern individual.',
    topSelling: true,
    stock: 20,
    tags: ['watches', 'luxury', 'accessories', 'designer']
  },
  {
    id: 3,
    name: 'Smart Home Speaker',
    price: 149.99,
    rating: 4.7,
    reviews: 156,
    image: '/products/speaker.jpg',
    category: 'Electronics',
    subcategory: 'Smart Home',
    discount: 20,
    description: 'Transform your living space with voice-controlled smart speakers providing immersive audio experience.',
    topSelling: true,
    stock: 42,
    tags: ['smart-home', 'speaker', 'voice-control', 'audio']
  },
  {
    id: 4,
    name: 'Luxury Perfume Set',
    price: 179.99,
    rating: 4.9,
    reviews: 92,
    image: '/products/perfume.jpg',
    category: 'Beauty',
    subcategory: 'Fragrances',
    discount: 0,
    description: 'A collection of exquisite fragrances crafted from the finest ingredients for a lasting impression.',
    topSelling: true,
    stock: 15,
    tags: ['perfume', 'fragrance', 'luxury', 'gift-set']
  },
  {
    id: 5,
    name: 'Men\'s Casual Shirt',
    price: 59.99,
    rating: 4.5,
    reviews: 75,
    image: '/images/products/shirt-1.jpg',
    category: 'Men\'s Fashion',
    subcategory: 'Casual Wear',
    discount: 0,
    description: 'Comfortable and stylish casual shirt perfect for everyday wear.',
    topSelling: false,
    stock: 50,
    tags: ['men', 'shirt', 'casual', 'cotton']
  },
  {
    id: 6,
    name: 'Women\'s Summer Dress',
    price: 79.99,
    rating: 4.6,
    reviews: 63,
    image: '/images/products/dress-1.jpg',
    category: 'Women\'s Fashion',
    subcategory: 'Dresses',
    discount: 5,
    description: 'Lightweight and flowy summer dress with elegant design.',
    topSelling: false,
    stock: 38,
    tags: ['women', 'dress', 'summer', 'casual']
  }
];

// Featured categories for homepage derived from products
export const featuredCategories = [
  {
    id: 1,
    name: 'Electronics',
    image: '/categories/electronics.jpg',
    count: products.filter(p => p.category === 'Electronics').length,
    description: 'Latest gadgets and tech accessories',
    href: '/products/electronics'
  },
  {
    id: 2,
    name: 'Fashion',
    image: '/categories/fashion.jpg',
    count: products.filter(p => p.category === 'Fashion' || p.category === 'Men\'s Fashion' || p.category === 'Women\'s Fashion').length,
    description: 'Trendy clothing and accessories',
    href: '/products/fashion'
  },
  {
    id: 3,
    name: 'Home & Living',
    image: '/categories/home.jpg',
    count: products.filter(p => p.category === 'Home & Living').length,
    description: 'Make your home beautiful',
    href: '/products/home-living'
  },
  {
    id: 4,
    name: 'Beauty',
    image: '/categories/beauty.jpg',
    count: products.filter(p => p.category === 'Beauty').length,
    description: 'Premium beauty products',
    href: '/products/beauty'
  }
];

// Get top selling products
export const getTopSellingProducts = () => products.filter(product => product.topSelling);

// Categories data for navigation derived from unique categories in products
export const categories = [
  { name: "Men's Fashion", href: "/products/mens-fashion" },
  { name: "Women's Fashion", href: "/products/womens-fashion" },
  { name: "Perfumes", href: "/products/perfumes" },
  { name: "Attar & Oils", href: "/products/attar-oils" },
  { name: "Accessories", href: "/products/accessories" },
  { name: "Footwear", href: "/products/footwear" },
  { name: "Electronics", href: "/products/electronics" },
  { name: "Home & Living", href: "/products/home-living" },
];

// Navigation items
export const navItems = [
  { name: "Home", href: "/" },
  { name: "Store", href: "/store" },
  { name: "Contact", href: "/contact" },
];

// Helper function to create URL-friendly slugs
export const createSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// Function to generate product URL
export const getProductUrl = (product) => {
  const productSlug = createSlug(product.name);
  const categorySlug = createSlug(product.category);
  const subcategorySlug = product.subcategory ? createSlug(product.subcategory) : null;
  
  return subcategorySlug
    ? `/products/${categorySlug}/${subcategorySlug}/${productSlug}`
    : `/products/${categorySlug}/${productSlug}`;
}; 