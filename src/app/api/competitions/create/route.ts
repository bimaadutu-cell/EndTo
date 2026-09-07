import { NextRequest, NextResponse } from "next/server";
import { createCompetition } from "@/lib/competition-store";
import { getQuestionsForCategory } from "@/lib/question-bank";

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

    // Build invite URL from the actual request host (production domain)
    // Avoid preview deployment URLs that require Vercel login
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    let baseUrl = process.env.APP_URL || "";
    if (!baseUrl && host) {
      // Prefer non-preview production URL
      if (host.includes("vercel.app") && host.includes("-")) {
        // Preview URL pattern: project-hash-team.vercel.app -> use env or relative
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
      } else {
        baseUrl = `${proto}://${host}`;
      }
    }
    if (!baseUrl) baseUrl = "https://websitekelas-xtkj-rpl-tkkr.vercel.app";

    return NextResponse.json({
      success: true,
      competition: {
        id: comp.id,
        inviteCode: comp.inviteCode,
        name: comp.name,
        category: comp.category,
        questionCount: comp.questions.length,
        inviteUrl: `${baseUrl}/join/${comp.inviteCode}`,
        status: comp.status,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Gagal membuat kompetisi" }, { status: 500 });
  }
}
