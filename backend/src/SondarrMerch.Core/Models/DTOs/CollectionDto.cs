namespace SondarrMerch.Core.Models.DTOs;

public sealed class CollectionDto
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public string? Handle { get; init; }
    public string? ImageUrl { get; init; }
}
