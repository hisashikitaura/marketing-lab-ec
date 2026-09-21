import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "ml_admin";

function hashPassword(password: string): string {
  return createHash("sha256").update(`ml-admin:${password}`).digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(hashPassword(password));
  const b = Buffer.from(hashPassword(expected));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function makeAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD || "unset";
  return createHash("sha256").update(`ml-admin-token:${secret}`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = makeAdminToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
