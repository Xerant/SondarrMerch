namespace SondarrMerch.Core.Models.DTOs;

/// <summary>The signed-in caller as the Merch API sees them.</summary>
public sealed class CurrentUserDto
{
    public required string UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public IReadOnlyList<string> Roles { get; init; } = [];
}
