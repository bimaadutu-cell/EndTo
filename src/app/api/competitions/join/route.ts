import { NextRequest, NextResponse } from "next/server";
import { joinCompetition, getCompetitionByCode } from "@/lib/competition-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const inviteCode = String(body.inviteCode || "").trim();
    const playerName = String(body.playerName || "").trim();

    if (!inviteCode || !playerName) {
      return NextResponse.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
    }

    const result = joinCompetition(inviteCode, playerName);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      player: {
        id: result.player.id,
        name: result.player.name,
        sessionToken: result.player.sessionToken,
      },
      competition: {
        id: result.competition.id,
        name: result.competition.name,
        inviteCode: result.competition.inviteCode,
        status: result.competition.status,
        playerCount: result.competition.players.length,
      },
    });
  } catch (e: any) {
    console.error("[JOIN ERROR]", e?.message);
    return NextResponse.json({ error: "Gagal bergabung. Coba lagi." }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code") || "";
    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
    }
    const comp = getCompetitionByCode(code);
    if (!comp) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan. Minta kode baru dari guru." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      id: comp.id,
      name: comp.name,
      status: comp.status,
      playerCount: comp.players.length,
      maxPlayers: comp.maxPlayers,
      category: comp.category,
    });
  } catch (e: any) {
    console.error("[JOIN GET ERROR]", e?.message);
    return NextResponse.json({ error: "Gagal memuat undangan" }, { status: 404 });
  }
}
