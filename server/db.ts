// Database connection for Replit Auth
// Reference: Replit Auth blueprint
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle({ client: pool, schema });
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
  }
} else {
  console.warn("DATABASE_URL not set. Database operations will fail.");
}

// Export a proxy that throws helpful errors if database is not configured
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!dbInstance) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    return (dbInstance as any)[prop];
  }
});
