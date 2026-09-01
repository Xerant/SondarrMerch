namespace SondarrMerch.Core.Models.DTOs;

/// <summary>Product listing filters. <see cref="After"/> is a provider cursor (e.g. Shopify) for the next page.</summary>
public sealed class ProductQueryDto
{
    public string? Search { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 24;
    /// <summary>Opaque cursor from a previous response for forward pagination.</summary>
    public string? After { get; init; }
}
