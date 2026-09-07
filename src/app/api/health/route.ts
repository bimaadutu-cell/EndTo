import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Only try DB if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      const { db } = await import("@/db");
      await db.execute(sql`select 1`);
      return Response.json({ ok: true, db: "connected" });
    }
    return Response.json({ ok: true, db: "demo-mode" });
  } catch (error) {
    console.warn("Health check DB error:", error);
    return Response.json({ ok: true, db: "unavailable" });
  }
}
