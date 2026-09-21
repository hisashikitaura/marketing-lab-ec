"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

async function postEvent(body: Record<string, unknown>) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* ignore */
  }
}

export function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (lastPath.current === key) return;
    lastPath.current = key;
    void postEvent({ type: "page_view", path: pathname });
  }, [pathname, searchParams]);

  return null;
}

export function trackClientEvent(body: Record<string, unknown>) {
  return postEvent(body);
}
