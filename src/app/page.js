import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CategoriesSection } from '@/components/home/categories-section';
import { Hero } from '@/components/home/hero';
import { Testimonials } from '@/components/home/testimonials';
import { Services } from '@/components/home/services';
import { TopSellingSection } from '@/components/home/top-selling-section';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CategoriesSection />
      <TopSellingSection/>
      <Testimonials />
      <Services />
      <Footer />
    </main>
  );
}

