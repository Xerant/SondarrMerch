namespace SondarrMerch.Core.Models.DTOs;

/// <summary>Optional pagination envelope for product listings (used by API responses).</summary>
public sealed class PagedProductsResultDto
{
    public required IReadOnlyList<ProductDto> Items { get; init; }
    public string? NextCursor { get; init; }
}
