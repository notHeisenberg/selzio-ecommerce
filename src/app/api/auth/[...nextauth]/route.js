import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiBaseUrl } from "@/lib/config";

// Ensure we have a valid API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
            // You might want to call your API to create or fetch the user
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
            }
          } catch (error) {
            console.error("Social auth error:", error);
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
      session.user = token.user || session.user;
      session.accessToken = token.accessToken;
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 