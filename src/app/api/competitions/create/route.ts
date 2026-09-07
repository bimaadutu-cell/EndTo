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

    const baseUrl = process.env.APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

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
