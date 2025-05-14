import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { CartProvider } from '@/hooks/use-cart';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Selzio - Your Premium Shopping Destination',
  description: 'Discover a world of premium products at Selzio. Shop the latest trends in fashion, electronics, home goods, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
