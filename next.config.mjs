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
  },
  // Disable trailing slashes to prevent 308 redirects
  trailingSlash: false,
};

export default nextConfig;
