"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { trackClientEvent } from "./AnalyticsBeacon";

type Props = {
  productId: string;
  slug: string;
  name: string;
  priceJpy: number;
  imageEmoji: string;
};

export function AddToCartButton(props: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function onClick() {
    addItem({
      productId: props.productId,
      slug: props.slug,
      name: props.name,
      priceJpy: props.priceJpy,
      imageEmoji: props.imageEmoji,
    });
    void trackClientEvent({
      type: "add_to_cart",
      productId: props.productId,
      value: props.priceJpy,
      currency: "jpy",
      path: `/products/${props.slug}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
    >
      {added ? "カートに追加しました ✓" : "カートに入れる"}
    </button>
  );
}
