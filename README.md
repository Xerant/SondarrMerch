# SondarrMerch — Plug-and-play merch microservice

Runs alongside `StreamingService` on port **5010**. Any Shopify-compatible storefront, WooCommerce store, or custom shop can be connected by implementing one interface.

## Adding a new provider

1. Create a folder under `src/SondarrMerch.Providers/YourProvider/`
2. Implement `ICommerceProvider` from `SondarrMerch.Core`
3. In `Program.cs`, swap the registered `ICommerceProvider` binding
4. Add your settings class + `appsettings.json` section

That's it. No controller changes needed.

## Running locally

```bash
cd src/SondarrMerch.API
dotnet run
# API: http://localhost:5010
# Swagger: http://localhost:5010/swagger
# Health: http://localhost:5010/health
```

## API surface

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/merch/products | List products (paginated) |
| GET | /api/merch/products/featured | Featured products |
| GET | /api/merch/products/{id} | Single product |
| GET | /api/merch/collections | All collections |
| GET | /api/merch/collections/{id}/products | Products in collection |
| POST | /api/merch/cart | Create cart |
| GET | /api/merch/cart/{id} | Get cart |
| POST | /api/merch/cart/{id}/lines | Add item |
| PATCH | /api/merch/cart/{id}/lines/{lineId} | Update quantity |
| DELETE | /api/merch/cart/{id}/lines/{lineId} | Remove item |
| POST | /api/merch/cart/{id}/checkout | Get checkout URL |
| POST | /api/merch/webhooks | Provider webhook receiver |

## Auth

Uses the same Supabase JWT as `StreamingService`. Set `Supabase:Url` in `appsettings.json`.
