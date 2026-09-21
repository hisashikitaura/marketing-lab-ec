import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import {
  SESSION_COOKIE,
  UTM_COOKIE,
  deserializeUtm,
  type UtmParams,
} from "./utm";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const id = uuidv4();
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return id;
}

export async function getSessionId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

export async function getUtmFromCookie(): Promise<UtmParams> {
  const jar = await cookies();
  return deserializeUtm(jar.get(UTM_COOKIE)?.value);
}

export async function setUtmCookie(utm: UtmParams): Promise<void> {
  const jar = await cookies();
  const { serializeUtm } = await import("./utm");
  jar.set(UTM_COOKIE, serializeUtm(utm), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
