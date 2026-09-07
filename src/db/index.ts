// Optional database connection - competition system works without it (in-memory)
// Only used if DATABASE_URL is set

let dbInstance: any = null;
let pool: any = null;

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  try {
    // Dynamic require to avoid hard type dependency during build
    const { drizzle } = require("drizzle-orm/node-postgres");
    const { Pool } = require("pg");

    const globalForDb = globalThis as typeof globalThis & {
      __arenaNextJsPostgresqlPool?: any;
    };

    pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }

    dbInstance = drizzle(pool);
  } catch (e) {
    console.warn("[db] Failed to init postgres:", e);
  }
} else {
  console.warn("[db] DATABASE_URL not set. Running in demo mode (in-memory).");
}

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!dbInstance) {
        throw new Error(
          "Database is not configured. Set DATABASE_URL or use demo mode."
        );
      }
      return dbInstance[prop];
    },
  }
);

export { pool };
