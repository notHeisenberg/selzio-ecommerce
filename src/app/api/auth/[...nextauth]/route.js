import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiBaseUrl, appBaseUrl } from "@/lib/config";

// Use the fixed API URL from config.js instead of directly using env variable
const API_URL = apiBaseUrl;

// Get the production URL from environment variables or config
const NEXTAUTH_URL = appBaseUrl || process.env.NEXTAUTH_URL || process.env.VERCEL_URL || '';

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
              
              // Store the redirect URL in the token if available
              const redirectUrl = data.redirectUrl || token.redirectUrl;
              if (redirectUrl) {
                token.redirectUrl = redirectUrl;
              }
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
        
        // Pass the redirect URL to the session if available
        if (token.redirectUrl) {
          session.redirectUrl = token.redirectUrl;
        }
        
        // Add an error flag if authentication failed
        if (token.user.error) {
          session.error = token.user.error;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle OAuth callback error case specifically
      if (url.includes('error=OAuthCallback')) {
        // Redirect to our custom redirect handler which will use stored redirect URL
        return `${baseUrl}/api/auth/callback/redirect`;
      }
      
      // Check if there's a callback URL in the URL parameters
      const urlObj = new URL(url, baseUrl);
      const callbackUrl = urlObj.searchParams.get('callbackUrl');
      
      // If we have a callbackUrl parameter and it's not the auth error URL, use it
      if (callbackUrl && !callbackUrl.includes('error=OAuthCallback')) {
        return callbackUrl;
      }
      
      // If the URL is relative (starts with /), make it absolute
      if (url.startsWith('/')) {
        // Use NEXTAUTH_URL from env if available, otherwise use baseUrl
        const base = NEXTAUTH_URL || baseUrl;
        return `${base}${url}`;
      }
      // If it's already absolute but on the same site, allow it
      else if (url.startsWith(baseUrl) || 
              (NEXTAUTH_URL && url.startsWith(NEXTAUTH_URL)) || 
              (process.env.VERCEL_URL && url.includes(process.env.VERCEL_URL)) ||
              (process.env.NETLIFY_URL && url.includes(process.env.NETLIFY_URL))) {
        return url;
      }
      
      // Default to the base URL for safety
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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 