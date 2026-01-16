"use client"

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RichTextSection } from '@/components/home/rich-text-section';
import { Hero } from '@/components/home/hero';
import { TopSellingSection } from '@/components/home/top-selling-section';
import { CombinedCollectionsSection } from '@/components/home/combined-collections-section';
import { SocialSidebar } from '@/components/layout/social-sidebar';

// Lazy load below-the-fold components to reduce initial bundle size
// These components are not immediately visible and can be loaded when needed
const Testimonials = dynamic(() => import('@/components/home/testimonials').then(mod => ({ default: mod.Testimonials })), {
  loading: () => (
    <div className="w-full py-16 bg-secondary/20 animate-pulse">
      <div className="container mx-auto px-4">
        <div className="h-8 w-64 bg-secondary/40 rounded mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-secondary/40 rounded" />
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const Services = dynamic(() => import('@/components/home/services').then(mod => ({ default: mod.Services })), {
  loading: () => (
    <div className="w-full py-12 bg-secondary/20 animate-pulse">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-secondary/40 rounded" />
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
});

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <SocialSidebar />
      <Hero />
      <CombinedCollectionsSection />
      {/* <RichTextSection /> */}
      <TopSellingSection />
      <Testimonials />
      <Services />
      <Footer />
    </main>
  );
}

