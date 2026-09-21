import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  makeAdminToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, makeAdminToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
