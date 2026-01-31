import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Only initialize database if valid URL is provided
const DATABASE_URL = process.env.DATABASE_URL;
const isValidDatabaseUrl =
  DATABASE_URL && !DATABASE_URL.includes("your_neon_database_url_here");

let db: any;

if (isValidDatabaseUrl) {
  // Neon serverless uses HTTPS; standard Postgres (e.g. Docker db:5432) uses TCP.
  // Use Neon driver only for Neon URLs so Docker with local Postgres works.
  const isNeon =
    DATABASE_URL!.includes("neon.tech") || DATABASE_URL!.startsWith("https://");

  if (isNeon) {
    const sql = neon(DATABASE_URL!);
    db = drizzleNeon(sql, { schema });
  } else {
    const pool = new Pool({ connectionString: DATABASE_URL });
    db = drizzlePg({ client: pool, schema });
  }
} else {
  // Dummy db object when database is not configured
  db = null;
}

export { db };
