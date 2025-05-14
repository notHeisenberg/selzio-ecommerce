"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Hero background"
          fill
          className="object-cover w-full"
          priority
        />
        <div className={`absolute inset-0 ${
          mounted && resolvedTheme === 'dark'
            ? 'bg-gradient-to-r from-black/80 to-black/60'
            : 'bg-gradient-to-r from-[#faf9f6]/60 to-[#faf9f6]/80'
        }`} />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          <h1 className={`text-5xl font-bold mb-4 ${
            mounted && resolvedTheme === 'dark' 
              ? 'text-white' 
              : 'text-gray-800'
          }`}>
            Discover Your Style
          </h1>
          <p className={`text-xl mb-8 ${
            mounted && resolvedTheme === 'dark' 
              ? 'text-gray-300' 
              : 'text-gray-600'
          }`}>
            Explore our curated collection of premium fashion and lifestyle products.
          </p>
          <div className="flex gap-4">
            {mounted && resolvedTheme === 'dark' ? (
              <>
                <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  Learn More
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="bg-gray-800 hover:bg-gray-700">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white">
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 