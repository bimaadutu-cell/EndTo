import { NextRequest, NextResponse } from "next/server";
import {
  joinCompetition,
  getCompetitionByCode,
  hydrateCompetition,
  type Competition,
} from "@/lib/competition-store";

export const dynamic = "force-dynamic";

function tryHydrate(token?: string | null): Competition | null {
  if (!token) return null;
  try {
    const json = Buffer.from(token, "base64url").toString("utf8");
    const data = JSON.parse(json) as Competition;
    if (!data?.id || !data?.inviteCode || !data?.questions) return null;
    return hydrateCompetition(data);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const inviteCode = String(body.inviteCode || "").trim().toUpperCase();
    const playerName = String(body.playerName || "").trim();
    const token = body.token || null;

    if (!inviteCode || !playerName) {
      return NextResponse.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
    }

    // Hydrate from token if this serverless instance doesn't have the competition
    if (!getCompetitionByCode(inviteCode) && token) {
      tryHydrate(token);
    }

    const result = joinCompetition(inviteCode, playerName);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
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
    const code = (request.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
    const token = request.nextUrl.searchParams.get("p") || request.nextUrl.searchParams.get("token");

    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
    }

    let comp = getCompetitionByCode(code);
    if (!comp && token) {
      comp = tryHydrate(token) || undefined;
    }

    if (!comp) {
      return NextResponse.json(
        {
          error:
            "Undangan tidak ditemukan. Pastikan memakai link lengkap dari guru (bukan hanya kode), atau minta guru buat kompetisi baru.",
        },
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
