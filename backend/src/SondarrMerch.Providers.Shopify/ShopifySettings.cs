namespace SondarrMerch.Providers.Shopify;

public sealed class ShopifySettings
{
    public const string Section = "Shopify";

    /// <summary>Shop hostname, e.g. <c>your-store.myshopify.com</c> (no scheme).</summary>
    public string ShopDomain { get; set; } = "";

    /// <summary>Storefront API access token (public, scoped to Storefront).</summary>
    public string StorefrontAccessToken { get; set; } = "";

    /// <summary>Optional Admin API webhook secret for HMAC verification on inbound webhooks.</summary>
    public string? WebhookSecret { get; set; }
}
