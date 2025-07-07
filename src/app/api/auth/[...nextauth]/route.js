import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiBaseUrl } from "@/lib/config";

// Use the fixed API URL from config.js instead of directly using env variable
const API_URL = apiBaseUrl;

// Helper function to determine the base URL based on environment
const getBaseUrl = () => {
  // For server-side rendering, trust the NEXTAUTH_URL environment variable first
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Check for platform-specific URLs
  if (process.env.NEXTAUTH_VERCEL_URL) {
    return process.env.NEXTAUTH_VERCEL_URL;
  }
  
  if (process.env.NEXTAUTH_NETLIFY_URL) {
    return process.env.NEXTAUTH_NETLIFY_URL;
  }
  
  // For Vercel deployments, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For Netlify deployments
  if (process.env.NETLIFY_URL || process.env.URL) {
    return process.env.NETLIFY_URL || process.env.URL;
  }
  
  // Fallback for local development
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

// Get list of trusted domains for multi-domain setup (Vercel + Netlify)
const getTrustedDomains = () => {
  const trustedDomains = [
    // Add both Vercel and Netlify URLs as trusted domains
    'https://selzio-ecommerce.vercel.app',
    'https://selzio-ecommerce.netlify.app',
  ];
  
  // Add environment-specific URLs if available
  if (process.env.NEXTAUTH_VERCEL_URL) {
    trustedDomains.push(process.env.NEXTAUTH_VERCEL_URL);
  }
  
  if (process.env.NEXTAUTH_NETLIFY_URL) {
    trustedDomains.push(process.env.NEXTAUTH_NETLIFY_URL);
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    trustedDomains.push(process.env.NEXT_PUBLIC_SITE_URL);
  }
  
  // Filter out duplicates and return unique domains
  return [...new Set(trustedDomains)];
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${API_URL}/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

          if (response.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              image: data.user.avatar,
              token: data.token,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For social login
        if (account.provider === "google" || account.provider === "facebook") {
          try {
            console.log("Attempting social login with provider:", account.provider);
            // Call API to create or fetch the user
            const response = await fetch(`${API_URL}/auth/social`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: user.name,
                email: user.email,
                provider: account.provider,
                providerId: account.providerAccountId,
                avatar: user.image,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              console.log("Social auth successful:", data.user.email);
              token.accessToken = data.token;
              token.user = data.user;
            } else {
              console.error("Social auth API error:", data.error);
              // Set token with minimal info to prevent undefined errors
              token.accessToken = "invalid-token";
              token.user = {
                email: user.email,
                name: user.name,
                error: data.error || "Authentication failed"
              };
            }
          } catch (error) {
            console.error("Social auth error:", error);
            // Set fallback token to prevent crashes
            token.accessToken = "error-token";
            token.user = {
              email: user.email,
              name: user.name,
              error: error.message || "Authentication failed"
            };
          }
        } else {
          // For credentials login
          token.accessToken = user.token;
          token.user = user;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure we have valid user data in the session
      if (token.user) {
        session.user = token.user;
        session.accessToken = token.accessToken;
        
        // Add an error flag if authentication failed
        if (token.user.error) {
          session.error = token.user.error;
        }
      }
      return session;
    },
    // Fix for callback URL in production
    async redirect({ url, baseUrl }) {
      // If the URL is absolute and starts with the baseUrl, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For relative URLs, prefix with baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Handle callback URLs from sessionStorage (common pattern in this app)
      if (url.includes('callbackUrl=')) {
        try {
          // Extract the callback URL
          const callbackParam = new URLSearchParams(url.split('?')[1]).get('callbackUrl');
          if (callbackParam) {
            // If it's from the same site or it's a relative URL, use it
            if (callbackParam.startsWith(baseUrl) || callbackParam.startsWith('/')) {
              return callbackParam;
            }
            
            // Get our list of trusted domains for multi-platform deployments
            const trustedDomains = getTrustedDomains();
            
            // Check if the callback domain matches any of our trusted domains
            for (const domain of trustedDomains) {
              if (callbackParam.startsWith(domain)) {
                return callbackParam;
              }
            }
            
            // If we got here, the callback domain isn't in our trusted list
            console.log("Untrusted callback URL:", callbackParam);
          }
        } catch (e) {
          console.error("Error parsing callback URL:", e);
        }
      }
      
      // Default to baseUrl if nothing else matches
      return baseUrl;
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Use the helper function to get the correct base URL
  baseUrl: getBaseUrl(),
  // Critical for production: Set the correct URL
  url: getBaseUrl(),
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 