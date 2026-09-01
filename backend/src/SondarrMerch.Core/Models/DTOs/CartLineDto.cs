namespace SondarrMerch.Core.Models.DTOs;

public sealed class CartLineDto
{
    public required string Id { get; init; }
    public string? ProductId { get; init; }
    public string? VariantId { get; init; }
    public required string Title { get; init; }
    public int Quantity { get; init; }
    public decimal? UnitPrice { get; init; }
    public string? Currency { get; init; }
    public string? ImageUrl { get; init; }
}
