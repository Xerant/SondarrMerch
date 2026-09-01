namespace SondarrMerch.Core.Models.DTOs;

public sealed class ProductDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public string? Handle { get; init; }
    public decimal? Price { get; init; }
    public string? Currency { get; init; }
    public string? ImageUrl { get; init; }
    public IReadOnlyList<string> ImageUrls { get; init; } = Array.Empty<string>();
    public bool Available { get; init; }
}
