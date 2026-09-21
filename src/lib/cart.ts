export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceJpy: number;
  quantity: number;
  imageEmoji: string;
};

export const CART_STORAGE_KEY = "ml_cart";

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceJpy * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
