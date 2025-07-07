# Netlify Deployment Guide for Selzio E-commerce

This guide will help you set up a flawless Netlify deployment for your Next.js e-commerce application.

## 1. Environment Variables

Set up the following environment variables in your Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment variables
2. Add these variables:

```
NEXTAUTH_URL=https://your-netlify-domain.netlify.app
NETLIFY_URL=https://your-netlify-domain.netlify.app
NEXTAUTH_SECRET=your-secure-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
```

## 2. Build Settings

Configure these build settings in your Netlify dashboard:

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Node.js version: 18.x or higher

## 3. Deploy Hooks

If you're using a CI/CD pipeline, set up deploy hooks in Netlify:

1. Go to Site settings > Build & deploy > Deploy notifications
2. Create a new deploy hook and use it in your CI/CD workflow

## 4. Redirects and Rewrites

The `_redirects` file and `netlify.toml` configuration we've added handle:

- OAuth callback redirects
- Client-side routing
- API routes

## 5. Troubleshooting

If you encounter issues with the deployment:

1. **OAuth Callback Errors**: Ensure your Google/Facebook OAuth credentials have the correct redirect URIs set up, including your Netlify domain.

2. **API Connection Issues**: Verify your API URLs are correctly set in environment variables.

3. **Deployment Failures**: Check the build logs in Netlify for specific errors.

4. **404 Errors**: Ensure the `_redirects` file is correctly placed in the `public` directory.

## 6. Post-Deployment Verification

After deployment, test these critical flows:

1. Social login (Google)
2. Checkout process
3. API connections
4. Page navigation

## 7. Performance Optimization

For better performance:

1. Enable Netlify's asset optimization
2. Set up proper cache headers
3. Consider using Netlify Edge Functions for critical paths

## 8. Monitoring

Set up monitoring to ensure your site remains performant:

1. Enable Netlify Analytics
2. Set up status alerts
3. Monitor API endpoint performance

---

Following these steps will ensure a smooth, error-free deployment of your Selzio E-commerce application on Netlify. 