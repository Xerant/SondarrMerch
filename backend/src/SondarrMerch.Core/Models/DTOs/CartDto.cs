namespace SondarrMerch.Core.Models.DTOs;

public sealed class CartDto
{
    public required string Id { get; init; }
    public IReadOnlyList<CartLineDto> Lines { get; init; } = Array.Empty<CartLineDto>();
    public decimal? Subtotal { get; init; }
    public string? Currency { get; init; }
    /// <summary>Present when the provider already exposes a checkout URL on the cart.</summary>
    public string? CheckoutUrl { get; init; }
}
