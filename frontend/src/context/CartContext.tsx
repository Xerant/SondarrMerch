import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import merchService from '../services/merchService';
import type { Cart } from '../types/merch';
import { useAuth } from './AuthContext';

// Per user, so a shared browser never hands one account's cart to another.
const cartIdKey = (userId: string) => `merch_cart_id:${userId}`;

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  /** Resolves false when the line couldn't be added (signed out, or the API failed). */
  addLine: (variantId: string, quantity?: number) => Promise<boolean>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  startCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/** The signed-in user's cart. Buying needs a Sondarr account, so there is no cart while signed out. */
export function CartProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const userId = status === 'authenticated' ? (user?.userId ?? null) : null;

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init(id: string) {
      setLoading(true);
      setError(null);
      try {
        const existingId = localStorage.getItem(cartIdKey(id));
        let active = existingId ? await merchService.getCart(existingId) : null;
        if (!active) {
          active = await merchService.createCart();
          localStorage.setItem(cartIdKey(id), active.id);
        }
        if (!cancelled) setCart(active);
      } catch {
        if (!cancelled) setError('Could not reach the merch store. Try again shortly.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (userId) {
      void init(userId);
    } else {
      setCart(null);
      setError(null);
      setLoading(status === 'loading');
    }
    return () => {
      cancelled = true;
    };
  }, [userId, status]);

  const addLine = useCallback(
    async (variantId: string, quantity = 1) => {
      if (!cart) return false;
      setError(null);
      try {
        setCart(await merchService.addLine(cart.id, variantId, quantity));
        return true;
      } catch {
        setError('Could not add that item to your cart.');
        return false;
      }
    },
    [cart],
  );

  const updateLine = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setError(null);
      try {
        setCart(await merchService.updateLine(cart.id, lineId, Math.max(1, quantity)));
      } catch {
        setError('Could not update that item.');
      }
    },
    [cart],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setError(null);
      try {
        setCart(await merchService.removeLine(cart.id, lineId));
      } catch {
        setError('Could not remove that item.');
      }
    },
    [cart],
  );

  const startCheckout = useCallback(async () => {
    if (!cart) return;
    setError(null);
    try {
      const url = await merchService.getCheckoutUrl(cart.id);
      window.location.href = url;
    } catch {
      setError('Checkout is not available right now. Please try again shortly.');
    }
  }, [cart]);

  const itemCount = useMemo(
    () => cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0,
    [cart],
  );

  const value = useMemo(
    () => ({ cart, loading, error, itemCount, addLine, updateLine, removeLine, startCheckout }),
    [cart, loading, error, itemCount, addLine, updateLine, removeLine, startCheckout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
