// Database connection for Replit Auth
// Reference: Replit Auth blueprint
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Database features will be unavailable.",
  );
}

export const db = process.env.DATABASE_URL
  ? drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL }), schema })
  : null;

