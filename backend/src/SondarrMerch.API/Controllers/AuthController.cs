using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sondarr.Auth.Shared.Services;
using SondarrMerch.Core.Models.DTOs;

namespace SondarrMerch.API.Controllers;

/// <summary>
/// Lets the storefront check who is signed in — via its own Supabase session
/// (Bearer) or one started on another Sondarr site (shared cookie).
/// </summary>
[ApiController]
[Route("api/auth")]
[Authorize]
public sealed class AuthController(IUserContextService userContext) : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<CurrentUserDto> Me()
    {
        var user = userContext.GetCurrentUser();
        if (user is null || string.IsNullOrEmpty(user.UserId))
            return Unauthorized();

        return Ok(new CurrentUserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            Roles = user.Roles.ToList()
        });
    }
}
