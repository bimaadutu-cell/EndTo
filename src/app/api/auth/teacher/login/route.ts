import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

    // Demo credentials that always work (no DB required)
    if ((username === "guruku" && password === "guruku113") || (username === "guru" && password === "guru123")) {
      const token = await new SignJWT({
        id: "demo-teacher",
        username: username,
        role: "teacher",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(new TextEncoder().encode(JWT_SECRET));

      const response = NextResponse.json({
        success: true,
        teacher: {
          id: "demo-teacher",
          username: "guru",
          name: username === "guruku" ? "Guru Kelas" : "Guru Demo",
        },
        demo: true,
      });

      response.cookies.set("teacher_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
        path: "/",
      });

      return response;
    }

    // Try real DB if available
    try {
      const { db } = await import("@/db");
      const { teachers } = await import("@/db/schema");

      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.username, username))
        .limit(1);

      if (!teacher) {
        return NextResponse.json(
          { error: "Username atau password salah" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(password, teacher.password);

      if (!isValid) {
        return NextResponse.json(
          { error: "Username atau password salah" },
          { status: 401 }
        );
      }

      const token = await new SignJWT({
        id: teacher.id,
        username: teacher.username,
        role: "teacher",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(new TextEncoder().encode(JWT_SECRET));

      const response = NextResponse.json({
        success: true,
        teacher: {
          id: teacher.id,
          username: teacher.username,
          name: teacher.name,
        },
      });

      response.cookies.set("teacher_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
        path: "/",
      });

      return response;
    } catch (dbError) {
      console.warn("DB not available for teacher login:", dbError);
      return NextResponse.json(
        { error: "Username atau password salah (mode demo: gunakan guru / guru123)" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}
