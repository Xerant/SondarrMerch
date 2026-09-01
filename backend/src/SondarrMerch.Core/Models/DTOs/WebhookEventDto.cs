namespace SondarrMerch.Core.Models.DTOs;

public sealed class WebhookEventDto
{
    public required string EventType { get; init; }
    public string? Topic { get; init; }
    public string? RawBody { get; init; }
    public IReadOnlyDictionary<string, string>? Headers { get; init; }
}
