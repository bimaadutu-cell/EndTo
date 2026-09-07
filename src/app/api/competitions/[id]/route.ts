import { NextRequest, NextResponse } from "next/server";
import {
  getCompetitionById,
  startCompetition,
  nextQuestion,
  getLeaderboard,
  submitAnswer,
  hydrateCompetition,
  getPlayerProgress,
  pauseCompetition,
  endCompetition,
  type Competition,
} from "@/lib/competition-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const token =
    request.nextUrl.searchParams.get("p") ||
    request.nextUrl.searchParams.get("token");
  const sessionToken = request.nextUrl.searchParams.get("session");
  if (token) tryHydrate(token);

  const comp = getCompetitionById(id);
  if (!comp) {
    return NextResponse.json(
      { error: "Tidak ditemukan. Buka ulang dari link undangan guru." },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }

  let playerView = null;
  if (sessionToken) {
    playerView = getPlayerProgress(id, sessionToken);
  }

  const answeredCount = comp.players.filter((p) => p.answers.length > 0).length;
  const finishedCount = comp.players.filter(
    (p) => p.status === "finished" || p.answers.length >= comp.questions.length
  ).length;

  return NextResponse.json(
    {
      id: comp.id,
      name: comp.name,
      status: comp.status,
      currentQuestionIndex: comp.currentQuestionIndex,
      totalQuestions: comp.questions.length,
      timePerQuestion: comp.timePerQuestion,
      questionStartedAt: comp.questionStartedAt,
      playerCount: comp.players.length,
      answeredCount,
      finishedCount,
      players: comp.players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        status: p.status,
        progress: p.answers.length,
      })),
      currentQuestion: playerView?.currentQuestion || null,
      playerProgress: playerView
        ? {
            currentIndex: playerView.currentIndex,
            totalQuestions: playerView.totalQuestions,
            score: playerView.score,
            finished: playerView.finished,
            questionStartedAt: playerView.questionStartedAt,
          }
        : null,
      sharedQuestion:
        !sessionToken &&
        comp.status === "running" &&
        comp.questions[comp.currentQuestionIndex]
          ? {
              id: comp.questions[comp.currentQuestionIndex].id,
              question: "Progress individu — lihat peserta di bawah",
              options: [],
              index: comp.currentQuestionIndex,
            }
          : null,
      leaderboard: getLeaderboard(id),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    action,
    teacherId,
    sessionToken,
    questionId,
    answerIndex,
    token,
  } = body;
  tryHydrate(token);

  if (action === "start") {
    const result = startCompetition(id, teacherId || "guruku");
    if ("error" in result)
      return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({
      success: true,
      status: result.status,
      message: "Kompetisi dimulai. Peserta langsung mendapat soal & auto-next aktif.",
    });
  }

  if (action === "pause") {
    const result = pauseCompetition(id);
    if ("error" in result)
      return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, status: result.status });
  }

  if (action === "end" || action === "finish") {
    const result = endCompetition(id);
    if ("error" in result)
      return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({
      success: true,
      status: result.status,
      leaderboard: getLeaderboard(id),
    });
  }

  if (action === "next") {
    const result = nextQuestion(id, teacherId || "guruku");
    if ("error" in result)
      return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({
      success: true,
      status: result.status,
      currentQuestionIndex: result.currentQuestionIndex,
      note: "Auto-next sudah aktif. Tombol next opsional.",
    });
  }

  if (action === "answer") {
    if (teacherId || body.role === "teacher") {
      return NextResponse.json(
        { error: "Guru tidak boleh menjawab soal (Host Mode)" },
        { status: 403 }
      );
    }
    if (!sessionToken || questionId === undefined || answerIndex === undefined) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }
    const result = submitAnswer(id, sessionToken, questionId, answerIndex);
    if ("error" in result)
      return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({
      success: true,
      ...result,
    });
  }

  if (action === "leaderboard") {
    return NextResponse.json({ leaderboard: getLeaderboard(id) });
  }

  if (action === "state") {
    if (!sessionToken) {
      return NextResponse.json({ error: "sessionToken required" }, { status: 400 });
    }
    const progress = getPlayerProgress(id, sessionToken);
    if (!progress) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 404 });
    }
    return NextResponse.json({ success: true, ...progress });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
