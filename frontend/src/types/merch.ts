export interface ProductVariant {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  available: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  handle: string | null;
  price: number | null;
  currency: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  variants: ProductVariant[];
  available: boolean;
}

export interface Collection {
  id: string;
  title: string;
  handle: string | null;
  imageUrl: string | null;
}

export interface CartLine {
  id: string;
  productId: string | null;
  variantId: string | null;
  title: string;
  quantity: number;
  unitPrice: number | null;
  currency: string | null;
  imageUrl: string | null;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  subtotal: number | null;
  currency: string | null;
  checkoutUrl: string | null;
}

export interface CheckoutUrl {
  url: string;
}
