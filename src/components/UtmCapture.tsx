"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Client hint: UTM cookie is primarily set by middleware.
 * This component re-triggers a soft navigation-aware check by posting
 * a lightweight beacon if UTMs are present (middleware already persisted them).
 */
export function UtmCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasUtm =
      searchParams.has("utm_source") ||
      searchParams.has("utm_medium") ||
      searchParams.has("utm_campaign") ||
      searchParams.has("utm_term") ||
      searchParams.has("utm_content");
    if (hasUtm) {
      // Middleware already wrote the cookie; no-op signal for observability.
      console.debug("[utm] captured from query");
    }
  }, [searchParams]);

  return null;
}
