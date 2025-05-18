"use client";

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Award, 
  Heart, 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Truck,
  CheckCircle2,
  Mail
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">About Selzio</h1>
              <p className="text-muted-foreground text-lg md:text-xl mb-8">
                Your trusted online destination for premium fashion and lifestyle products in Bangladesh.
              </p>
              <div className="flex justify-center">
                <Button asChild size="lg">
                  <Link href="/store">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                  <p className="text-muted-foreground mb-6">
                    Founded in 2020, Selzio began with a simple vision: to make high-quality fashion and lifestyle products accessible to everyone in Bangladesh.
                  </p>
                  <p className="text-muted-foreground mb-6">
                    What started as a small online store has grown into a trusted e-commerce platform, serving thousands of customers across the country. Our journey has been driven by our commitment to quality, authenticity, and customer satisfaction.
                  </p>
                  <p className="text-muted-foreground">
                    Today, we continue to expand our product offerings while maintaining our core values of trust, quality, and exceptional service. With every package we deliver, we're not just sending products – we're delivering experiences.
                  </p>
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative h-[400px] w-full max-w-[500px] rounded-lg overflow-hidden shadow-lg">
                  <Image 
                    src="/images/about/store-front.jpg" 
                    alt="Selzio Store" 
                    fill 
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission & Values</h2>
              <p className="text-muted-foreground text-lg">
                At Selzio, our mission is to provide authentic, high-quality products that enhance your lifestyle, backed by exceptional customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Quality</h3>
                <p className="text-muted-foreground">
                  We're committed to offering only the highest quality products. Every item undergoes rigorous quality checks before reaching our customers.
                </p>
              </div>

              <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Customer First</h3>
                <p className="text-muted-foreground">
                  Our customers are at the heart of everything we do. We strive to provide exceptional service and responsive support at every step.
                </p>
              </div>

              <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our product offerings and services to meet the changing needs and preferences of our customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Meet Our Team</h2>
              <p className="text-muted-foreground text-lg">
                The passionate individuals behind Selzio who work tirelessly to bring you the best shopping experience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10">
                  <Image
                    src="/images/team/founder.jpg"
                    alt="Mahfuz Antor"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Mahfuz Antor</h3>
                <p className="text-primary mb-4">Founder & CEO</p>
                <p className="text-muted-foreground mb-4">
                  With over 10 years of experience in retail and e-commerce, Mahfuz leads our vision and strategic direction.
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10">
                  <Image
                    src="/images/team/operations.jpg"
                    alt="Sarah Ahmed"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Sarah Ahmed</h3>
                <p className="text-primary mb-4">Operations Manager</p>
                <p className="text-muted-foreground mb-4">
                  Sarah ensures smooth operations, from inventory management to order fulfillment and customer satisfaction.
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-primary/10">
                  <Image
                    src="/images/team/marketing.jpg"
                    alt="Rahul Khan"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Rahul Khan</h3>
                <p className="text-primary mb-4">Marketing Director</p>
                <p className="text-muted-foreground mb-4">
                  Rahul brings creative strategies to connect our brand with customers across Bangladesh.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Why Choose Selzio</h2>
              <p className="text-muted-foreground text-lg">
                We're committed to providing an exceptional shopping experience from browsing to delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <div className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">100% Authentic Products</h3>
                  <p className="text-muted-foreground">
                    We guarantee the authenticity of all products sold on our platform. We source directly from authorized distributors and manufacturers.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Truck className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Nationwide Delivery</h3>
                  <p className="text-muted-foreground">
                    We deliver to all corners of Bangladesh. Express delivery available in Dhaka with standard shipping to all other locations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Star className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Superior Customer Service</h3>
                  <p className="text-muted-foreground">
                    Our dedicated support team is ready to assist you with any questions or concerns, ensuring a smooth shopping experience.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Target className="h-6 w-6 text-primary mt-1 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Curated Selection</h3>
                  <p className="text-muted-foreground">
                    We carefully select each product in our catalog to ensure quality, style, and value for our customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Achievements</h2>
              <p className="text-muted-foreground text-lg">
                We're proud of how far we've come and the milestones we've reached.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
                <div className="text-4xl font-bold text-primary mb-2">5K+</div>
                <p className="text-muted-foreground">Products Delivered</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
                <div className="text-4xl font-bold text-primary mb-2">64</div>
                <p className="text-muted-foreground">Districts Covered</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm text-center">
                <div className="text-4xl font-bold text-primary mb-2">4.8</div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-6">Ready to Experience Selzio?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Browse our collection and discover premium products delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/store">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">
                    <Mail className="h-5 w-5 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 