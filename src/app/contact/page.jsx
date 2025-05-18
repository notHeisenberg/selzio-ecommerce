"use client";

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Facebook,
  Instagram,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the form data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
        variant: "success",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="bg-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
              <p className="text-muted-foreground text-lg">
                Have questions or need assistance? We're here to help you with any inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information and Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Contact Information */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground mb-8">
                    We'd love to hear from you. Please feel free to contact us using any of the methods below.
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-foreground">Our Location</h3>
                      <p className="text-muted-foreground mt-1">
                        Basundhara R/A, Block F<br />
                        Dhaka, Bangladesh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-6 w-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-foreground">Phone</h3>
                      <p className="text-muted-foreground mt-1">
                        +880 1724318584<br />
                        +880 1778053337
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-foreground">Email</h3>
                      <p className="text-muted-foreground mt-1">
                        selziobd@gmail.com<br />
                        support@selzio.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-foreground">Business Hours</h3>
                      <p className="text-muted-foreground mt-1">
                        Saturday - Thursday: 10:00 AM - 8:00 PM<br />
                        Friday: 2:00 PM - 8:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="https://www.facebook.com/selziobd" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-primary" />
                    </a>
                    <a 
                      href="https://www.instagram.com/selzio_bd" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-primary" />
                    </a>
                    <a 
                      href="https://m.me/selziobd" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">
                          Your Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Enter message subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Type your message here..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="min-h-[150px] bg-background"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Find Us</h2>
              <p className="text-muted-foreground">
                Visit our store in Basundhara R/A, Dhaka for in-person shopping and customer service.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md border border-border">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14600.536651660368!2d90.41586687930019!3d23.81979292923073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c62fb95f16c1%3A0xb333248370356dee!2sBasundhara%20Residential%20Area%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1715007537407!5m2!1sen!2sbd" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Selzio Store Location"
                className="w-full"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find quick answers to common questions about our services.
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">What are your shipping options?</h3>
                <p className="text-muted-foreground">
                  We offer nationwide delivery across Bangladesh with options for standard delivery (3-5 business days) and express delivery (1-2 business days) in Dhaka.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">How can I track my order?</h3>
                <p className="text-muted-foreground">
                  Once your order is shipped, you'll receive a tracking number via email or SMS. You can also track your order from your account dashboard.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">What is your return policy?</h3>
                <p className="text-muted-foreground">
                  We accept returns within 7 days of delivery for most items in their original condition. Please contact our customer service team to initiate a return.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 