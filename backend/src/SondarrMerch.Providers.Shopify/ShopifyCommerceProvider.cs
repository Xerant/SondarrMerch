using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SondarrMerch.Core.Interfaces;
using SondarrMerch.Core.Models.DTOs;

namespace SondarrMerch.Providers.Shopify;

/// <summary>Shopify Storefront GraphQL implementation of <see cref="ICommerceProvider"/>.</summary>
public sealed class ShopifyCommerceProvider : ICommerceProvider
{
    private const string ApiVersion = "2024-10";

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    private readonly HttpClient _http;
    private readonly IOptionsSnapshot<ShopifySettings> _options;
    private readonly ILogger<ShopifyCommerceProvider> _logger;

    public ShopifyCommerceProvider(
        HttpClient http,
        IOptionsSnapshot<ShopifySettings> options,
        ILogger<ShopifyCommerceProvider> logger)
    {
        _http = http;
        _options = options;
        _logger = logger;
    }

    public string ProviderName => "Shopify";

    public async Task<IEnumerable<ProductDto>> GetProductsAsync(ProductQueryDto query, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var first = Math.Clamp(query.PageSize, 1, 250);
        string? after = query.After;
        if (query.Page > 1 && string.IsNullOrEmpty(after))
        {
            after = await WalkToPageCursorAsync(query, first, ct).ConfigureAwait(false);
            if (after is null) return Array.Empty<ProductDto>();
        }

        var q = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim();
        var variables = new Dictionary<string, object?>
        {
            ["first"] = first,
            ["after"] = after,
            ["query"] = q
        };

        const string gql = """
            query Products($first: Int!, $after: String, $query: String) {
              products(first: $first, after: $after, query: $query) {
                edges {
                  cursor
                  node {
                    id
                    title
                    description
                    availableForSale
                    handle
                    featuredImage { url }
                    images(first: 10) { edges { node { url } } }
                    priceRange { minVariantPrice { amount currencyCode } }
                  }
                }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        if (!data.TryGetProperty("products", out var products) || !products.TryGetProperty("edges", out var edges))
            return Array.Empty<ProductDto>();

        return edges.EnumerateArray()
            .Select(e => e.TryGetProperty("node", out var n) ? MapProduct(n) : null)
            .Where(p => p is not null)
            .Cast<ProductDto>()
            .ToList();
    }

    public async Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var gid = ToProductGid(productId);
        var variables = new Dictionary<string, object?> { ["id"] = gid };

        const string gql = """
            query Product($id: ID!) {
              node(id: $id) {
                ... on Product {
                  id
                  title
                  description
                  availableForSale
                  handle
                  featuredImage { url }
                  images(first: 10) { edges { node { url } } }
                  priceRange { minVariantPrice { amount currencyCode } }
                }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        if (!data.TryGetProperty("node", out var node) || node.ValueKind == JsonValueKind.Null)
            return null;
        return MapProduct(node);
    }

    public async Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync(int limit = 8, CancellationToken ct = default)
    {
        var q = new ProductQueryDto { Page = 1, PageSize = Math.Clamp(limit, 1, 50), After = null, Search = null };
        return await GetProductsAsync(q, ct).ConfigureAwait(false);
    }

    public async Task<IEnumerable<CollectionDto>> GetCollectionsAsync(CancellationToken ct = default)
    {
        EnsureClientConfigured();
        const string gql = """
            query Collections {
              collections(first: 50) {
                edges {
                  node {
                    id
                    title
                    handle
                    image { url }
                  }
                }
              }
            }
            """;

        var data = await GraphqlAsync(gql, null, ct).ConfigureAwait(false);
        if (!data.TryGetProperty("collections", out var col) || !col.TryGetProperty("edges", out var edges))
            return Array.Empty<CollectionDto>();

        return edges.EnumerateArray()
            .Select(e =>
            {
                if (!e.TryGetProperty("node", out var n)) return null;
                return new CollectionDto
                {
                    Id = n.GetProperty("id").GetString() ?? "",
                    Title = n.GetProperty("title").GetString() ?? "",
                    Handle = n.TryGetProperty("handle", out var h) ? h.GetString() : null,
                    ImageUrl = n.TryGetProperty("image", out var img) && img.ValueKind != JsonValueKind.Null
                        ? img.TryGetProperty("url", out var u) ? u.GetString() : null
                        : null
                };
            })
            .Where(c => c is not null)
            .Cast<CollectionDto>()
            .ToList();
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCollectionAsync(string collectionId, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var gid = ToCollectionGid(collectionId);
        var variables = new Dictionary<string, object?> { ["id"] = gid, ["first"] = 50 };

        const string gql = """
            query CollectionProducts($id: ID!, $first: Int!) {
              collection(id: $id) {
                products(first: $first) {
                  edges {
                    node {
                      id
                      title
                      description
                      availableForSale
                      handle
                      featuredImage { url }
                      images(first: 10) { edges { node { url } } }
                      priceRange { minVariantPrice { amount currencyCode } }
                    }
                  }
                }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        if (!data.TryGetProperty("collection", out var collection) || collection.ValueKind == JsonValueKind.Null)
            return Array.Empty<ProductDto>();
        if (!collection.TryGetProperty("products", out var products) || !products.TryGetProperty("edges", out var edges))
            return Array.Empty<ProductDto>();

        return edges.EnumerateArray()
            .Select(e => e.TryGetProperty("node", out var n) ? MapProduct(n) : null)
            .Where(p => p is not null)
            .Cast<ProductDto>()
            .ToList();
    }

    public async Task<CartDto> CreateCartAsync(CancellationToken ct = default)
    {
        EnsureClientConfigured();
        const string gql = """
            mutation CartCreate {
              cartCreate(input: {}) {
                cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } product { id title } } } } } } }
                userErrors { field message }
              }
            }
            """;

        var data = await GraphqlAsync(gql, null, ct).ConfigureAwait(false);
        ThrowUserErrors(data, "cartCreate");
        var cart = data.GetProperty("cartCreate").GetProperty("cart");
        return MapCart(cart);
    }

    public async Task<CartDto> AddToCartAsync(string cartId, CartLineItemDto item, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var merchandiseId = ToVariantGid(item.VariantId);
        var variables = new Dictionary<string, object?>
        {
            ["cartId"] = ToCartGid(cartId),
            ["lines"] = new object[]
            {
                new Dictionary<string, object?> { ["merchandiseId"] = merchandiseId, ["quantity"] = item.Quantity }
            }
        };

        const string gql = """
            mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } product { id title } } } } } } } }
                userErrors { field message }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        ThrowUserErrors(data, "cartLinesAdd");
        return MapCart(data.GetProperty("cartLinesAdd").GetProperty("cart"));
    }

    public async Task<CartDto> UpdateCartLineAsync(string cartId, string lineId, int quantity, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var variables = new Dictionary<string, object?>
        {
            ["cartId"] = ToCartGid(cartId),
            ["lines"] = new object[]
            {
                new Dictionary<string, object?> { ["id"] = lineId.StartsWith("gid://", StringComparison.Ordinal) ? lineId : $"gid://shopify/CartLine/{lineId}", ["quantity"] = quantity }
            }
        };

        const string gql = """
            mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
              cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } product { id title } } } } } } } }
                userErrors { field message }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        ThrowUserErrors(data, "cartLinesUpdate");
        return MapCart(data.GetProperty("cartLinesUpdate").GetProperty("cart"));
    }

    public async Task<CartDto> RemoveFromCartAsync(string cartId, string lineId, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var lineGid = lineId.StartsWith("gid://", StringComparison.Ordinal) ? lineId : $"gid://shopify/CartLine/{lineId}";
        var variables = new Dictionary<string, object?>
        {
            ["cartId"] = ToCartGid(cartId),
            ["lineIds"] = new[] { lineGid }
        };

        const string gql = """
            mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
              cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart { id checkoutUrl cost { totalAmount { amount currencyCode } } lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title image { url } price { amount currencyCode } product { id title } } } } } } } }
                userErrors { field message }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        ThrowUserErrors(data, "cartLinesRemove");
        return MapCart(data.GetProperty("cartLinesRemove").GetProperty("cart"));
    }

    public async Task<CartDto?> GetCartAsync(string cartId, CancellationToken ct = default)
    {
        EnsureClientConfigured();
        var variables = new Dictionary<string, object?> { ["id"] = ToCartGid(cartId) };

        const string gql = """
            query Cart($id: ID!) {
              cart(id: $id) {
                id
                checkoutUrl
                cost { totalAmount { amount currencyCode } }
                lines(first: 50) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          title
                          image { url }
                          price { amount currencyCode }
                          product { id title }
                        }
                      }
                    }
                  }
                }
              }
            }
            """;

        var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
        if (!data.TryGetProperty("cart", out var cart) || cart.ValueKind == JsonValueKind.Null)
            return null;
        return MapCart(cart);
    }

    public async Task<CheckoutUrlDto> GetCheckoutUrlAsync(string cartId, CancellationToken ct = default)
    {
        var cart = await GetCartAsync(cartId, ct).ConfigureAwait(false);
        if (cart?.CheckoutUrl is { Length: > 0 } url)
            return new CheckoutUrlDto { Url = url };
        throw new InvalidOperationException("Checkout URL not available for this cart. Ensure the cart exists and checkout is enabled for the storefront.");
    }

    public Task<WebhookEventDto?> ParseWebhookAsync(string rawBody, IHeaderDictionary headers, CancellationToken ct = default)
    {
        _ = ct;
        var secret = _options.Value.WebhookSecret;
        if (!string.IsNullOrEmpty(secret) && headers.TryGetValue("X-Shopify-Hmac-Sha256", out var hmacValues))
        {
            var provided = hmacValues.FirstOrDefault();
            if (!VerifyShopifyHmac(rawBody, secret, provided))
            {
                _logger.LogWarning("Shopify webhook HMAC verification failed.");
                return Task.FromResult<WebhookEventDto?>(null);
            }
        }

        headers.TryGetValue("X-Shopify-Topic", out var topics);
        var topic = topics.FirstOrDefault();
        return Task.FromResult<WebhookEventDto?>(new WebhookEventDto
        {
            EventType = topic ?? "unknown",
            Topic = topic,
            RawBody = rawBody,
            Headers = headers.ToDictionary(h => h.Key, h => string.Join(",", h.Value.ToArray()), StringComparer.OrdinalIgnoreCase)
        });
    }

    private void EnsureClientConfigured()
    {
        var o = _options.Value;
        if (string.IsNullOrWhiteSpace(o.ShopDomain) || string.IsNullOrWhiteSpace(o.StorefrontAccessToken))
            throw new InvalidOperationException("Configure Shopify:ShopDomain and Shopify:StorefrontAccessToken.");
    }

    private async Task<string?> WalkToPageCursorAsync(ProductQueryDto query, int first, CancellationToken ct)
    {
        string? cursor = query.After;
        for (var p = 1; p < query.Page; p++)
        {
            var variables = new Dictionary<string, object?> { ["first"] = first, ["after"] = cursor, ["query"] = string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim() };
            const string gql = """
                query Products($first: Int!, $after: String, $query: String) {
                  products(first: $first, after: $after, query: $query) {
                    pageInfo { endCursor hasNextPage }
                  }
                }
                """;
            var data = await GraphqlAsync(gql, variables, ct).ConfigureAwait(false);
            var pi = data.GetProperty("products").GetProperty("pageInfo");
            if (!pi.GetProperty("hasNextPage").GetBoolean()) return null;
            cursor = pi.GetProperty("endCursor").GetString();
        }
        return cursor;
    }

    private async Task<JsonElement> GraphqlAsync(string query, Dictionary<string, object?>? variables, CancellationToken ct)
    {
        var host = NormalizeHost(_options.Value.ShopDomain);
        var uri = new Uri($"https://{host}/api/{ApiVersion}/graphql.json");
        var payload = JsonSerializer.Serialize(new { query, variables }, JsonOpts);
        using var req = new HttpRequestMessage(HttpMethod.Post, uri);
        req.Content = new StringContent(payload, Encoding.UTF8, "application/json");
        req.Headers.TryAddWithoutValidation("X-Shopify-Storefront-Access-Token", _options.Value.StorefrontAccessToken);

        using var resp = await _http.SendAsync(req, ct).ConfigureAwait(false);
        var body = await resp.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        if (root.TryGetProperty("errors", out var topErrors) && topErrors.ValueKind == JsonValueKind.Array && topErrors.GetArrayLength() > 0)
        {
            var msg = string.Join("; ", topErrors.EnumerateArray().Select(e => e.TryGetProperty("message", out var m) ? m.GetString() : e.ToString()));
            throw new InvalidOperationException($"Shopify GraphQL error: {msg}");
        }

        if (!root.TryGetProperty("data", out var data) || data.ValueKind == JsonValueKind.Null)
            throw new InvalidOperationException("Shopify GraphQL returned no data.");

        return data;
    }

    private static void ThrowUserErrors(JsonElement data, string mutationName)
    {
        if (!data.TryGetProperty(mutationName, out var m)) return;
        if (!m.TryGetProperty("userErrors", out var errs) || errs.ValueKind != JsonValueKind.Array || errs.GetArrayLength() == 0)
            return;
        var msg = string.Join("; ", errs.EnumerateArray().Select(e => e.TryGetProperty("message", out var x) ? x.GetString() : e.ToString()));
        throw new InvalidOperationException($"Shopify {mutationName}: {msg}");
    }

    private static ProductDto MapProduct(JsonElement n)
    {
        var images = new List<string>();
        if (n.TryGetProperty("images", out var imgs) && imgs.TryGetProperty("edges", out var imgEdges))
        {
            foreach (var ie in imgEdges.EnumerateArray())
            {
                if (ie.TryGetProperty("node", out var inode) && inode.TryGetProperty("url", out var iu))
                {
                    var s = iu.GetString();
                    if (!string.IsNullOrEmpty(s)) images.Add(s);
                }
            }
        }

        string? featured = null;
        if (n.TryGetProperty("featuredImage", out var fi) && fi.ValueKind != JsonValueKind.Null && fi.TryGetProperty("url", out var fu))
            featured = fu.GetString();

        decimal? price = null;
        string? currency = null;
        if (n.TryGetProperty("priceRange", out var pr) && pr.TryGetProperty("minVariantPrice", out var mvp))
        {
            if (mvp.TryGetProperty("amount", out var amt) && decimal.TryParse(amt.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                price = d;
            if (mvp.TryGetProperty("currencyCode", out var cc))
                currency = cc.GetString();
        }

        return new ProductDto
        {
            Id = n.GetProperty("id").GetString() ?? "",
            Title = n.GetProperty("title").GetString() ?? "",
            Description = n.TryGetProperty("description", out var desc) ? desc.GetString() : null,
            Handle = n.TryGetProperty("handle", out var h) ? h.GetString() : null,
            Price = price,
            Currency = currency,
            ImageUrl = featured ?? images.FirstOrDefault(),
            ImageUrls = images,
            Available = n.TryGetProperty("availableForSale", out var afs) && afs.GetBoolean()
        };
    }

    private static CartDto MapCart(JsonElement cart)
    {
        var lines = new List<CartLineDto>();
        if (cart.TryGetProperty("lines", out var linesEl) && linesEl.TryGetProperty("edges", out var edges))
        {
            foreach (var e in edges.EnumerateArray())
            {
                if (!e.TryGetProperty("node", out var node)) continue;
                var qty = node.TryGetProperty("quantity", out var q) ? q.GetInt32() : 0;
                string title = "";
                string? variantId = null;
                string? productId = null;
                decimal? unitPrice = null;
                string? cur = null;
                string? imageUrl = null;
                if (node.TryGetProperty("merchandise", out var merch) && merch.ValueKind != JsonValueKind.Null)
                {
                    variantId = merch.TryGetProperty("id", out var vid) ? vid.GetString() : null;
                    title = merch.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                    if (merch.TryGetProperty("product", out var prod))
                    {
                        productId = prod.TryGetProperty("id", out var pid) ? pid.GetString() : null;
                        var pt = prod.TryGetProperty("title", out var ptt) ? ptt.GetString() : null;
                        if (!string.IsNullOrEmpty(pt)) title = string.IsNullOrEmpty(title) ? pt! : $"{pt} — {title}";
                    }
                    if (merch.TryGetProperty("price", out var priceEl))
                    {
                        if (priceEl.TryGetProperty("amount", out var am) && decimal.TryParse(am.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                            unitPrice = d;
                        if (priceEl.TryGetProperty("currencyCode", out var c))
                            cur = c.GetString();
                    }
                    if (merch.TryGetProperty("image", out var img) && img.ValueKind != JsonValueKind.Null && img.TryGetProperty("url", out var u))
                        imageUrl = u.GetString();
                }

                lines.Add(new CartLineDto
                {
                    Id = node.GetProperty("id").GetString() ?? "",
                    ProductId = productId,
                    VariantId = variantId,
                    Title = title,
                    Quantity = qty,
                    UnitPrice = unitPrice,
                    Currency = cur,
                    ImageUrl = imageUrl
                });
            }
        }

        decimal? subtotal = null;
        string? currency = null;
        if (cart.TryGetProperty("cost", out var cost) && cost.TryGetProperty("totalAmount", out var ta))
        {
            if (ta.TryGetProperty("amount", out var am) && decimal.TryParse(am.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
                subtotal = d;
            if (ta.TryGetProperty("currencyCode", out var c))
                currency = c.GetString();
        }

        string? checkoutUrl = cart.TryGetProperty("checkoutUrl", out var cu) && cu.ValueKind != JsonValueKind.Null
            ? cu.GetString()
            : null;

        return new CartDto
        {
            Id = cart.GetProperty("id").GetString() ?? "",
            Lines = lines,
            Subtotal = subtotal,
            Currency = currency,
            CheckoutUrl = checkoutUrl
        };
    }

    private static string NormalizeHost(string shopDomain)
    {
        var h = shopDomain.Trim();
        h = h.Replace("https://", "", StringComparison.OrdinalIgnoreCase).Replace("http://", "", StringComparison.OrdinalIgnoreCase).TrimEnd('/');
        return h;
    }

    private static string ToProductGid(string id) =>
        id.StartsWith("gid://shopify/Product/", StringComparison.Ordinal) ? id : $"gid://shopify/Product/{id}";

    private static string ToCollectionGid(string id) =>
        id.StartsWith("gid://shopify/Collection/", StringComparison.Ordinal) ? id : $"gid://shopify/Collection/{id}";

    private static string ToVariantGid(string id) =>
        id.StartsWith("gid://shopify/ProductVariant/", StringComparison.Ordinal) ? id : $"gid://shopify/ProductVariant/{id}";

    private static string ToCartGid(string id) =>
        id.StartsWith("gid://shopify/Cart/", StringComparison.Ordinal) ? id : $"gid://shopify/Cart/{id}";

    private static bool VerifyShopifyHmac(string body, string secret, string? providedBase64)
    {
        if (string.IsNullOrEmpty(providedBase64)) return false;
        byte[] expected;
        try { expected = Convert.FromBase64String(providedBase64); }
        catch (FormatException) { return false; }
        var key = Encoding.UTF8.GetBytes(secret);
        var data = Encoding.UTF8.GetBytes(body);
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(data);
        return hash.Length == expected.Length && CryptographicOperations.FixedTimeEquals(hash, expected);
    }
}
