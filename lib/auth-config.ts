import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// Edge-safe: no db/adapter imports. Used by middleware and as base for full auth.

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

export const authConfig: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn() {
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLearn = nextUrl.pathname.startsWith("/learn");

      if (isOnDashboard || isOnLearn) {
        if (isLoggedIn) return true;
        return false;
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
