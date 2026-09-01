namespace SondarrMerch.Core.Models.DTOs;

public sealed class CartLineItemDto
{
    /// <summary>Provider variant/sku id (e.g. Shopify Merchandise GID).</summary>
    public required string VariantId { get; init; }
    public int Quantity { get; init; } = 1;
}
