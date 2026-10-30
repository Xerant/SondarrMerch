using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SondarrMerch.Core.Interfaces;
using SondarrMerch.Core.Models.DTOs;
using SondarrMerch.Core.Services;

namespace SondarrMerch.API.Controllers;

/// <summary>
/// Catalog reads are public so anyone can browse. Cart and checkout need a
/// signed-in Sondarr account (Bearer token or the shared .sondarr.com cookie).
/// </summary>
[ApiController]
[Route("api/merch")]
[Authorize]
public sealed class MerchController : ControllerBase
{
    private readonly MerchService _merch;
    private readonly ICommerceProvider _provider;

    public MerchController(MerchService merch, ICommerceProvider provider)
    {
        _merch = merch;
        _provider = provider;
    }

    [HttpGet("products")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        [FromQuery] string? after = null,
        CancellationToken ct = default)
    {
        var query = new ProductQueryDto { Search = search, Page = page, PageSize = pageSize, After = after };
        var items = await _merch.GetProductsAsync(query, ct).ConfigureAwait(false);
        return Ok(items);
    }

    [HttpGet("products/featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeatured([FromQuery] int limit = 8, CancellationToken ct = default)
    {
        return Ok(await _merch.GetFeaturedProductsAsync(limit, ct).ConfigureAwait(false));
    }

    [HttpGet("products/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProductDto>> GetProduct(string id, CancellationToken ct = default)
    {
        var product = await _merch.GetProductByIdAsync(id, ct).ConfigureAwait(false);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpGet("collections")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<CollectionDto>>> GetCollections(CancellationToken ct = default)
    {
        return Ok(await _merch.GetCollectionsAsync(ct).ConfigureAwait(false));
    }

    [HttpGet("collections/{id}/products")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetCollectionProducts(string id, CancellationToken ct = default)
    {
        return Ok(await _merch.GetProductsByCollectionAsync(id, ct).ConfigureAwait(false));
    }

    [HttpPost("cart")]
    public async Task<ActionResult<CartDto>> CreateCart(CancellationToken ct = default)
    {
        return Ok(await _merch.CreateCartAsync(ct).ConfigureAwait(false));
    }

    [HttpGet("cart/{id}")]
    public async Task<ActionResult<CartDto>> GetCart(string id, CancellationToken ct = default)
    {
        var cart = await _merch.GetCartAsync(id, ct).ConfigureAwait(false);
        return cart is null ? NotFound() : Ok(cart);
    }

    [HttpPost("cart/{id}/lines")]
    public async Task<ActionResult<CartDto>> AddLine(string id, [FromBody] CartLineItemDto body, CancellationToken ct = default)
    {
        return Ok(await _merch.AddToCartAsync(id, body, ct).ConfigureAwait(false));
    }

    [HttpPatch("cart/{id}/lines/{lineId}")]
    public async Task<ActionResult<CartDto>> UpdateLine(string id, string lineId, [FromBody] UpdateLineBody body, CancellationToken ct = default)
    {
        return Ok(await _merch.UpdateCartLineAsync(id, lineId, body.Quantity, ct).ConfigureAwait(false));
    }

    [HttpDelete("cart/{id}/lines/{lineId}")]
    public async Task<ActionResult<CartDto>> RemoveLine(string id, string lineId, CancellationToken ct = default)
    {
        return Ok(await _merch.RemoveFromCartAsync(id, lineId, ct).ConfigureAwait(false));
    }

    [HttpPost("cart/{id}/checkout")]
    public async Task<ActionResult<CheckoutUrlDto>> Checkout(string id, CancellationToken ct = default)
    {
        return Ok(await _merch.GetCheckoutUrlAsync(id, ct).ConfigureAwait(false));
    }

    [HttpPost("webhooks")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct = default)
    {
        using var reader = new StreamReader(Request.Body);
        var raw = await reader.ReadToEndAsync(ct).ConfigureAwait(false);
        var evt = await _provider.ParseWebhookAsync(raw, Request.Headers, ct).ConfigureAwait(false);
        // Nothing consumes the event yet; acknowledge without echoing the payload back.
        return evt is null ? Unauthorized() : Accepted();
    }
}

public sealed class UpdateLineBody
{
    public int Quantity { get; set; }
}
