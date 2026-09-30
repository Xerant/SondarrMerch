import merchApi from './merchApi';
import type { Cart, Collection, Product } from '../types/merch';

class MerchService {
  /** Browse the product catalog, optionally filtered by a search term. */
  async getProducts(search?: string, page = 1, pageSize = 24): Promise<Product[]> {
    const response = await merchApi.get<Product[]>('/merch/products', {
      params: { search, page, pageSize },
    });
    return response.data;
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const response = await merchApi.get<Product[]>('/merch/products/featured', {
      params: { limit },
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await merchApi.get<Product>(`/merch/products/${encodeURIComponent(id)}`);
    return response.data;
  }

  async getCollections(): Promise<Collection[]> {
    const response = await merchApi.get<Collection[]>('/merch/collections');
    return response.data;
  }

  async getCollectionProducts(collectionId: string): Promise<Product[]> {
    const response = await merchApi.get<Product[]>(`/merch/collections/${encodeURIComponent(collectionId)}/products`);
    return response.data;
  }

  async createCart(): Promise<Cart> {
    const response = await merchApi.post<Cart>('/merch/cart');
    return response.data;
  }

  async getCart(cartId: string): Promise<Cart | null> {
    try {
      const response = await merchApi.get<Cart>(`/merch/cart/${encodeURIComponent(cartId)}`);
      return response.data;
    } catch (err) {
      if (axiosIs404(err)) return null;
      throw err;
    }
  }

  async addLine(cartId: string, variantId: string, quantity = 1): Promise<Cart> {
    const response = await merchApi.post<Cart>(`/merch/cart/${encodeURIComponent(cartId)}/lines`, {
      variantId,
      quantity,
    });
    return response.data;
  }

  async updateLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
    const response = await merchApi.patch<Cart>(
      `/merch/cart/${encodeURIComponent(cartId)}/lines/${encodeURIComponent(lineId)}`,
      { quantity },
    );
    return response.data;
  }

  async removeLine(cartId: string, lineId: string): Promise<Cart> {
    const response = await merchApi.delete<Cart>(
      `/merch/cart/${encodeURIComponent(cartId)}/lines/${encodeURIComponent(lineId)}`,
    );
    return response.data;
  }

  async getCheckoutUrl(cartId: string): Promise<string> {
    const response = await merchApi.post<{ url: string }>(`/merch/cart/${encodeURIComponent(cartId)}/checkout`);
    return response.data.url;
  }
}

function axiosIs404(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'response' in err &&
    (err as { response?: { status?: number } }).response?.status === 404;
}

export default new MerchService();
