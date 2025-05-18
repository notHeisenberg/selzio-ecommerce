# Setting Up Social Authentication for Selzio

This guide explains how to set up Google and Facebook authentication for the Selzio e-commerce application.

## Prerequisites

Before you begin, make sure you have:

1. A Google Developer account
2. A Facebook Developer account
3. Your Selzio application running in development or production

## Setting Up Google Authentication

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - For development: `http://localhost:3000`
   - For production: `https://yourdomain.com`
8. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
9. Click "Create"
10. Note your Client ID and Client Secret

## Setting Up Facebook Authentication

1. Go to the [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one (choose "Consumer" or "Business" type)
3. Add the "Facebook Login" product to your app
4. Go to the Facebook Login settings
5. Add the following OAuth Redirect URI:
   - For development: `http://localhost:3000/api/auth/callback/facebook`
   - For production: `https://yourdomain.com/api/auth/callback/facebook`
6. Save changes
7. From your app's dashboard, note your App ID and App Secret

## Configuring Environment Variables

Create or update your `.env.local` file with the following variables:

```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

For production, update the NEXTAUTH_URL to your production domain.

## Generate NextAuth Secret

For the NEXTAUTH_SECRET, you should generate a secure random string:

```bash
openssl rand -base64 32
```

## Testing

1. Start your application with `npm run dev`
2. Navigate to the login page
3. Try logging in with Google and Facebook
4. Ensure you are properly redirected after authentication

## Troubleshooting

If you encounter issues:

1. Check that your OAuth credentials are correctly set in your `.env.local` file
2. Verify that your redirect URIs are correctly configured in the Google and Facebook developer consoles
3. Check browser console for any errors
4. Check the server logs for authentication errors
5. Ensure that cookies are being properly set (no CORS issues)

## Note on Callback URLs

The callback URLs follow this pattern:
- Google: `/api/auth/callback/google`
- Facebook: `/api/auth/callback/facebook`

These paths are handled by NextAuth.js automatically. 