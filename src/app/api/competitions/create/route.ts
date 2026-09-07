import { NextRequest, NextResponse } from "next/server";
import { createCompetition, serializeForToken } from "@/lib/competition-store";
import { getQuestionsForCategory } from "@/lib/question-bank";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, questionCount, timePerQuestion, maxPlayers, teacherId } = body;

    if (!name || !category) {
      return NextResponse.json({ error: "Nama dan kategori wajib diisi" }, { status: 400 });
    }

    const questions = getQuestionsForCategory(category, questionCount || 10);
    if (questions.length === 0) {
      return NextResponse.json({ error: "Tidak ada soal untuk kategori ini" }, { status: 400 });
    }

    const comp = createCompetition({
      name,
      description,
      category,
      questions,
      timePerQuestion: timePerQuestion || 20,
      maxPlayers: maxPlayers || 50,
      createdBy: teacherId || "guruku",
    });

    // Verify immediately
    const { getCompetitionByCode } = await import("@/lib/competition-store");
    const verified = getCompetitionByCode(comp.inviteCode);
    if (!verified) {
      return NextResponse.json(
        { error: "Kompetisi dibuat tapi gagal diverifikasi. Coba lagi." },
        { status: 500 }
      );
    }

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    let baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
    if (!baseUrl && host) baseUrl = `${proto}://${host}`;
    if (!baseUrl) baseUrl = "https://websitekelas-xtkj-rpl-tkkr.vercel.app";

    // Payload for cross-instance hydration (base64url)
    const payload = serializeForToken(comp);
    const token = Buffer.from(JSON.stringify(payload)).toString("base64url");

    return NextResponse.json({
      success: true,
      competition: {
        id: comp.id,
        inviteCode: comp.inviteCode,
        name: comp.name,
        category: comp.category,
        questionCount: comp.questions.length,
        inviteUrl: `${baseUrl}/join/${comp.inviteCode}?p=${token}`,
        status: comp.status,
        token,
      },
    });
  } catch (e: any) {
    console.error("[CREATE COMP]", e?.message);
    return NextResponse.json({ error: e.message || "Gagal membuat kompetisi" }, { status: 500 });
  }
}
