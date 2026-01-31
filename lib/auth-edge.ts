import NextAuth from "next-auth";
import { authConfig } from "./auth-config";

// Edge-safe auth for middleware. No db/adapter (uses JWT strategy only).
export const { auth } = NextAuth(authConfig);
