import { NextRequest, NextResponse } from "next/server";
import { joinCompetition, getCompetitionByCode } from "@/lib/competition-store";

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, playerName } = await request.json();
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
    return NextResponse.json({ error: e.message || "Gagal bergabung" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Kode diperlukan" }, { status: 400 });
  const comp = getCompetitionByCode(code);
  if (!comp) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  return NextResponse.json({
    id: comp.id,
    name: comp.name,
    status: comp.status,
    playerCount: comp.players.length,
    maxPlayers: comp.maxPlayers,
    category: comp.category,
  });
}
