namespace SondarrMerch.Core.Models.DTOs;

public sealed class ProductVariantDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public decimal? Price { get; init; }
    public string? Currency { get; init; }
    public bool Available { get; init; }
}
