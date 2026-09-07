import { NextRequest, NextResponse } from "next/server";
import {
  getCompetitionById,
  startCompetition,
  nextQuestion,
  getLeaderboard,
  submitAnswer,
  hydrateCompetition,
  type Competition,
} from "@/lib/competition-store";

function tryHydrate(token?: string | null) {
  if (!token) return;
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const data = JSON.parse(json) as Competition;
    if (data?.id) hydrateCompetition(data);
  } catch {}
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("p") || request.nextUrl.searchParams.get("token");
  if (token) tryHydrate(token);
  const comp = getCompetitionById(id);
  if (!comp) return NextResponse.json({ error: "Tidak ditemukan. Buka ulang dari link undangan guru." }, { status: 404 });

  const q = comp.questions[comp.currentQuestionIndex];
  return NextResponse.json({
    id: comp.id,
    name: comp.name,
    status: comp.status,
    currentQuestionIndex: comp.currentQuestionIndex,
    totalQuestions: comp.questions.length,
    timePerQuestion: comp.timePerQuestion,
    questionStartedAt: comp.questionStartedAt,
    playerCount: comp.players.length,
    players: comp.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      status: p.status,
    })),
    // Only send current question (no answers) when running
    currentQuestion:
      comp.status === "running" && q
        ? {
            id: q.id,
            question: q.question,
            options: q.options,
            index: comp.currentQuestionIndex,
          }
        : null,
    leaderboard: comp.status === "finished" ? getLeaderboard(id) : undefined,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, teacherId, sessionToken, questionId, answerIndex, token } = body;
  tryHydrate(token);

  if (action === "start") {
    const result = startCompetition(id, teacherId || "guruku");
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, status: result.status });
  }

  if (action === "next") {
    const result = nextQuestion(id, teacherId || "guruku");
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({
      success: true,
      status: result.status,
      currentQuestionIndex: result.currentQuestionIndex,
    });
  }

  if (action === "answer") {
    // Teachers/hosts cannot submit answers
    if (teacherId || body.role === "teacher") {
      return NextResponse.json({ error: "Guru tidak boleh menjawab soal (Host Mode)" }, { status: 403 });
    }
    if (!sessionToken || questionId === undefined || answerIndex === undefined) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }
    const result = submitAnswer(id, sessionToken, questionId, answerIndex);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, ...result });
  }

  if (action === "leaderboard") {
    return NextResponse.json({ leaderboard: getLeaderboard(id) });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
