import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "ml_session";
const UTM_COOKIE = "ml_utm";
const MAX_AGE = 60 * 60 * 24 * 30;

function randomId(): string {
  // Edge-safe UUID-ish id
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { searchParams } = req.nextUrl;

  if (!req.cookies.get(SESSION_COOKIE)?.value) {
    res.cookies.set(SESSION_COOKIE, randomId(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });
  }

  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  const utmTerm = searchParams.get("utm_term");
  const utmContent = searchParams.get("utm_content");

  if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
    res.cookies.set(
      UTM_COOKIE,
      JSON.stringify({
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
      }
    );
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
