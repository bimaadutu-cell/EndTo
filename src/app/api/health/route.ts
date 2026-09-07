export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    db: process.env.DATABASE_URL ? "configured" : "demo-mode",
    time: new Date().toISOString(),
  });
}
