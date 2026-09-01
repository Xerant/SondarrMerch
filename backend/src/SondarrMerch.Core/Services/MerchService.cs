using SondarrMerch.Core.Interfaces;
using SondarrMerch.Core.Models.DTOs;

namespace SondarrMerch.Core.Services;

public sealed class MerchService
{
    private readonly ICommerceProvider _provider;

    public MerchService(ICommerceProvider provider) => _provider = provider;

    public string ProviderName => _provider.ProviderName;

    public Task<IEnumerable<ProductDto>> GetProductsAsync(ProductQueryDto query, CancellationToken ct = default) =>
        _provider.GetProductsAsync(query, ct);

    public Task<ProductDto?> GetProductByIdAsync(string productId, CancellationToken ct = default) =>
        _provider.GetProductByIdAsync(productId, ct);

    public Task<IEnumerable<ProductDto>> GetFeaturedProductsAsync(int limit = 8, CancellationToken ct = default) =>
        _provider.GetFeaturedProductsAsync(limit, ct);

    public Task<IEnumerable<CollectionDto>> GetCollectionsAsync(CancellationToken ct = default) =>
        _provider.GetCollectionsAsync(ct);

    public Task<IEnumerable<ProductDto>> GetProductsByCollectionAsync(string collectionId, CancellationToken ct = default) =>
        _provider.GetProductsByCollectionAsync(collectionId, ct);

    public Task<CartDto> CreateCartAsync(CancellationToken ct = default) =>
        _provider.CreateCartAsync(ct);

    public Task<CartDto> AddToCartAsync(string cartId, CartLineItemDto item, CancellationToken ct = default) =>
        _provider.AddToCartAsync(cartId, item, ct);

    public Task<CartDto> UpdateCartLineAsync(string cartId, string lineId, int quantity, CancellationToken ct = default) =>
        _provider.UpdateCartLineAsync(cartId, lineId, quantity, ct);

    public Task<CartDto> RemoveFromCartAsync(string cartId, string lineId, CancellationToken ct = default) =>
        _provider.RemoveFromCartAsync(cartId, lineId, ct);

    public Task<CartDto?> GetCartAsync(string cartId, CancellationToken ct = default) =>
        _provider.GetCartAsync(cartId, ct);

    public Task<CheckoutUrlDto> GetCheckoutUrlAsync(string cartId, CancellationToken ct = default) =>
        _provider.GetCheckoutUrlAsync(cartId, ct);
}
