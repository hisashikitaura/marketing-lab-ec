"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/components/AnalyticsBeacon";

export function ViewItemTracker({
  productId,
  path,
  value,
}: {
  productId: string;
  path: string;
  value: number;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackClientEvent({
      type: "view_item",
      productId,
      path,
      value,
      currency: "jpy",
    });
  }, [productId, path, value]);
  return null;
}
