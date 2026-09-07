import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Demo credentials (always work, no DB required)
const DEMO_TEACHERS: Record<string, { password: string; name: string }> = {
  guruku: { password: "guruku113", name: "Guru Kelas" },
  guru: { password: "guru123", name: "Guru Demo" },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const key = String(username).toLowerCase().trim();
    const demo = DEMO_TEACHERS[key];

    if (!demo || demo.password !== password) {
      return NextResponse.json(
        { error: "Username atau password salah. Gunakan: guruku / guruku113" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      id: `teacher-${key}`,
      username: key,
      role: "teacher",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json({
      success: true,
      teacher: {
        id: `teacher-${key}`,
        username: key,
        name: demo.name,
      },
      demo: true,
    });

    response.cookies.set("teacher_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}
