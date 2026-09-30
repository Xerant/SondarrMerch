export interface ShopifyMockProduct {
  id: string;
  name: string;
  price: number;
  inv: number;
}

export interface ManualProduct {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: string;
  inv: number;
  variants: string[];
}

export type WizardStep =
  | 'choose'
  | 'shopify-form'
  | 'shopify-connecting'
  | 'shopify-sync'
  | 'manual-form';

export type SellMode = 'wizard' | 'dashboard';
