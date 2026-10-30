# SondarrMerch — Plug-and-play merch microservice

Runs alongside `StreamingService` on port **5010**. Any Shopify-compatible storefront, WooCommerce store, or custom shop can be connected by implementing one interface.

## Adding a new provider

1. Create a project under `backend/src/` (e.g. `SondarrMerch.Providers.YourProvider`)
2. Implement `ICommerceProvider` from `SondarrMerch.Core`
3. In `Program.cs`, swap the registered `ICommerceProvider` binding
4. Add your settings class + `appsettings.json` section

That's it. No controller changes needed.

## Running locally

```bash
cd backend/src/SondarrMerch.API
dotnet run
# API: http://localhost:5010
# Swagger: http://localhost:5010/swagger (Development only)
# Health: http://localhost:5010/health
```

## API surface

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/auth/me | The signed-in caller (401 when signed out) |
| POST | /api/auth/session, /api/auth/logout | Set / clear the shared `.sondarr.com` session cookie |
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

Uses `Sondarr.Auth.Shared` (GitHub Packages, see `backend/nuget.config`): the Supabase JWT from the
`Authorization` header, falling back to the shared `.sondarr.com` cookie.

- **Public:** product and collection reads, so anyone can browse.
- **Signed in:** cart and checkout (`/api/merch/cart*`) and `/api/auth/me`.
- **Webhooks:** no JWT; rejected unless `Shopify:WebhookSecret` is set and the HMAC matches.

## Deploying (DigitalOcean App Platform)

`backend/Dockerfile` (build context `backend/`, listens on 8080, health `/health`). Needs:

| Variable | Scope | Notes |
|---|---|---|
| `NUGET_GITHUB_TOKEN` | Build time, secret | `read:packages` PAT, to restore `Sondarr.Auth.Shared` |
| `Cors__Origins__0` | Run time | The storefront's URL (default `https://merch.sondarr.com`) |
| `Shopify__ShopDomain`, `Shopify__StorefrontAccessToken` | Run time, secret | Catalog/cart return 500 until set |
| `Shopify__WebhookSecret` | Run time, secret | Webhooks are rejected until set |

Frontend (`frontend/`, static site, all build time): `VITE_MERCH_API_URL`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_SONDARR_APP_URL`. See `frontend/.env.example`.
