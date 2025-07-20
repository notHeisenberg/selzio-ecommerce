import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiBaseUrl } from "@/lib/config";

// Use the fixed API URL from config.js instead of directly using env variable
const API_URL = apiBaseUrl;

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