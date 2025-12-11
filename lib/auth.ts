import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";

// Build providers array only if credentials are available
const providers = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  );
}

// Only use Drizzle adapter if database is configured
const DATABASE_URL = process.env.DATABASE_URL;
const isValidDatabaseUrl = DATABASE_URL && !DATABASE_URL.includes("your_neon_database_url_here");

export const authConfig: NextAuthConfig = {
  adapter: isValidDatabaseUrl ? DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) : undefined,
  providers,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to token on sign in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to session from token
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow account linking: if user exists with same email, link the account
      if (account && user.email) {
        return true;
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLearn = nextUrl.pathname.startsWith("/learn");
      
      if (isOnDashboard || isOnLearn) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return true;
      }
      
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

