using Microsoft.AspNetCore.Http;
using SondarrMerch.Core.Models.DTOs;

namespace SondarrMerch.Core.Interfaces;

/// <summary>
/// The single interface any merch provider must implement to integrate with Sondarr.
/// Implement this, register it in Program.cs, and your storefront is live.
/// </summary>
public interface ICommerceProvider
{
    /// <summary>Human-readable provider name, e.g. "Shopify", "WooCommerce".</summary>
    string ProviderName { get; }

    // ── Products ──────────────────────────────────────────────────────────────
    Task<IEnumerable<ProductDto>> GetProductsAsync(ProductQueryDto query, CancellationToken ct = default);
    Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken ct = default);
    Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync(int limit = 8, CancellationToken ct = default);

    // ── Collections / Categories ──────────────────────────────────────────────
    Task<IEnumerable<CollectionDto>> GetCollectionsAsync(CancellationToken ct = default);
    Task<IEnumerable<ProductDto>> GetProductsByCollectionAsync(string collectionId, CancellationToken ct = default);

    // ── Cart ─────────────────────────────────────────────────────────────────
    Task<CartDto> CreateCartAsync(CancellationToken ct = default);
    Task<CartDto> AddToCartAsync(string cartId, CartLineItemDto item, CancellationToken ct = default);
    Task<CartDto> UpdateCartLineAsync(string cartId, string lineId, int quantity, CancellationToken ct = default);
    Task<CartDto> RemoveFromCartAsync(string cartId, string lineId, CancellationToken ct = default);
    Task<CartDto?> GetCartAsync(string cartId, CancellationToken ct = default);

    // ── Checkout ─────────────────────────────────────────────────────────────
    /// <summary>Returns a provider-hosted checkout URL. Sondarr redirects the user there.</summary>
    Task<CheckoutUrlDto> GetCheckoutUrlAsync(string cartId, CancellationToken ct = default);

    // ── Webhooks ─────────────────────────────────────────────────────────────
    /// <summary>Validate and parse an inbound webhook payload from the provider.</summary>
    Task<WebhookEventDto?> ParseWebhookAsync(string rawBody, IHeaderDictionary headers, CancellationToken ct = default);
}
