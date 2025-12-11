import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Only initialize database if valid URL is provided
const DATABASE_URL = process.env.DATABASE_URL;
const isValidDatabaseUrl = DATABASE_URL && !DATABASE_URL.includes("your_neon_database_url_here");

let db: any;

if (isValidDatabaseUrl) {
  const sql = neon(DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  // Dummy db object when database is not configured
  // This allows the app to run without a database for testing OAuth UI
  db = null;
}

export { db };

