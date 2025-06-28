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
    <div className="relative h-[750px] w-full overflow-hidden">
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
      <div className="relative h-full container mx-auto px-4 flex items-end pb-10 justify-center">
        <div className="text-center">
          <div className="flex gap-6 justify-center">
            {mounted && resolvedTheme === 'dark' ? (
              <>
                <Button asChild className="bg-transparent border border-white text-white hover:bg-white/10 rounded-none py-6 px-16 ">
                  <Link href="/store">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild className="text-white hover:bg-white/20 rounded-none py-6 px-16" variant="outline">
                  <Link href="/store">
                    Collections
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="bg-transparent text-gray-800 hover:bg-gray-800/10 border border-gray-800 rounded-none py-6 px-16">
                  <Link href="/store">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild className="text-gray-800 hover:bg-gray-800 hover:text-white rounded-none py-6 px-16" variant="outline">
                  <Link href="/store">
                    Collections
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 