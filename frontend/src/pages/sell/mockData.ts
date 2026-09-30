import type { ShopifyMockProduct } from './types';

/** Local-only fixture standing in for a real Shopify catalog sync — this wizard is not wired to a backend yet. */
export const SHOPIFY_MOCK: ShopifyMockProduct[] = [
  { id: 's1', name: 'Vinyl Sticker Sheet', price: 9, inv: 120 },
  { id: 's2', name: 'Lo-Fi Sessions Beanie', price: 24, inv: 64 },
  { id: 's3', name: 'Analog Tour Longsleeve', price: 36, inv: 48 },
  { id: 's4', name: 'Zine Vol. 2', price: 14, inv: 200 },
];

export const CATEGORIES = ['Apparel', 'Accessories', 'Vinyl & Media'];
