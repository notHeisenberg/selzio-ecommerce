# Selzio E-commerce Platform

A modern e-commerce platform built with Next.js, featuring social authentication, product management, and a seamless shopping experience.

## Features

- 🔐 Social Authentication (Google & Facebook)
- 🛍️ Product Catalog
- 🛒 Shopping Cart
- 💳 Secure Checkout
- 👤 User Profile Management
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive Design

## Prerequisites

Before you begin, ensure you have:

1. Node.js 18.x or later
2. npm or yarn
3. MongoDB database
4. Google Cloud Console account
5. Facebook Developer account
6. Cloudinary account (for image uploads)

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# MongoDB
MONGODB_URI=your-mongodb-uri

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Social Authentication Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add authorized JavaScript origins:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
7. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`

### Facebook OAuth Setup

1. Go to the [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add the "Facebook Login" product
4. Configure OAuth Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://your-domain.com/api/auth/callback/facebook`

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/selzio-ecommerce.git
cd selzio-ecommerce
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Deployment

### Environment Variables

For production deployment, update your environment variables:

1. Set `NEXTAUTH_URL` to your production domain
2. Ensure all OAuth credentials are configured for production
3. Update MongoDB URI to production database
4. Configure Cloudinary for production

### Deployment Steps

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

### Vercel Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## Troubleshooting

### Social Authentication Issues

If you encounter authentication issues:

1. Verify all environment variables are correctly set
2. Check OAuth credentials in Google/Facebook developer consoles
3. Ensure callback URLs are properly configured
4. Check browser console for errors
5. Monitor server logs for authentication errors

### Common Issues

- **CORS Errors**: Ensure your production domain is properly configured in OAuth settings
- **Callback Errors**: Verify callback URLs match exactly in both environment and OAuth settings
- **Session Issues**: Check NEXTAUTH_SECRET is properly set and consistent

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
<<<<<<< Updated upstream
=======



>>>>>>> Stashed changes
