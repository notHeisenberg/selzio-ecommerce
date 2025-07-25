"use client"

import { Truck, Headset, Shield, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export function Services() {

  const services = [
    {
      id: 1,
      title: "Free Delivery",
      description: "Free shipping on all orders over 2000 BDT",
      icon: Truck,
    },
    {
      id: 2,
      title: "24/7 Support",
      description: "Friendly customer support available 24/7",
      icon: Headset,
    },
    {
      id: 3,
      title: "Secure Payment",
      description: "100% secure and encrypted payment methods",
      icon: Shield,
    },
    // {
    //   id: 4,
    //   title: "Easy Returns",
    //   description: "30-day money-back guarantee",
    //   icon: RefreshCcw,
    // },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide the best shopping experience with premium services tailored to your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              viewport={{ once: true }}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                transition: { duration: 0.2 }
              }}
              className="group border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors rounded-none h-full"
            >
              <div className="p-6 bg-white dark:bg-gray-900 transition-colors h-full flex flex-col">
                {/* Icon Area */}
                <div className="mb-6 flex justify-center">
                  <motion.div 
                    className="h-16 w-16 rounded-none border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <service.icon className="h-8 w-8 text-white dark:text-black" />
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3 text-black dark:text-white group-hover:underline decoration-2 underline-offset-4 transition-all">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground transition-all group-hover:pl-2 duration-300">
                    {service.description}
                  </p>
                </div>
                
                {/* Bottom Border Animation */}
                <div className="mt-auto pt-4">
                  <div className="w-0 h-0.5 bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}