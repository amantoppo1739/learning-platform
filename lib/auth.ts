import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";
import { authConfig } from "./auth-config";

// Full auth with adapter for API routes (Node). Middleware uses auth-edge.ts (no db).
const DATABASE_URL = process.env.DATABASE_URL;
const isValidDatabaseUrl =
  DATABASE_URL && !DATABASE_URL.includes("your_neon_database_url_here");

const config = {
  ...authConfig,
  adapter: isValidDatabaseUrl
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
export { authConfig };
