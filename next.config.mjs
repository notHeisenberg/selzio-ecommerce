/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'image1.jpg',
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all test hostnames during development
      }
    ],
    unoptimized: process.env.NODE_ENV === 'production', // For Netlify deployment
  },
  // Enable output standalone for Netlify
  output: 'standalone',
  // Add trailing slash for consistent URLs
  trailingSlash: true,
};

export default nextConfig;
