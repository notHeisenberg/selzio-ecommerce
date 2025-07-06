"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function RichTextSection() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <section className="py-8 md:py-12 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center max-w-xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        <strong>Selzio Styles</strong>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-base text-slate-600 dark:text-slate-400 mb-6"
                    >
                        <p> Discover a world of style and essentials! We bring you quality, variety, and convenience all in one place. Shop now and elevate your vibe!</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        {mounted && resolvedTheme === 'dark' ? (
                            <Button asChild className="bg-transparent border border-white text-white hover:bg-white/10 rounded-none py-6 px-16">
                                <Link href="/store">
                                    Shop now!!
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild className="bg-transparent text-gray-800 hover:bg-gray-800/10 border border-gray-800 rounded-none py-6 px-16">
                                <Link href="/store">
                                    Shop now!!
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
} 