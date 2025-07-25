import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RichTextSection } from '@/components/home/rich-text-section';
import { Hero } from '@/components/home/hero';
import { Testimonials } from '@/components/home/testimonials';
import { Services } from '@/components/home/services';
import { TopSellingSection } from '@/components/home/top-selling-section';
import { CombinedCollectionsSection } from '@/components/home/combined-collections-section';
import { SocialSidebar } from '@/components/layout/social-sidebar';

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <SocialSidebar />
      <Hero />
      <CombinedCollectionsSection />
      {/* <RichTextSection /> */}
      <TopSellingSection/>
      <Testimonials />
      <Services />
      <Footer />
    </main>
  );
}

