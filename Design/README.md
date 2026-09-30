# Handoff: Sondarr Merch — Storefront + Artist Selling Tools

## Overview
Two connected features extending Sondarr (radio-style music streaming platform):
1. **Merch Shop** — a customer-facing storefront (browse, product detail, cart, checkout) where fans buy artist merch, with a visible revenue-share ("Fair-Pay") message on every purchase.
2. **Sell Merch (Artist Onboarding + Dashboard)** — lets an artist either connect an existing Shopify store (auto-sync catalog) or manually upload their own products/pricing, then manage everything from an ongoing dashboard.

Stack target: **React** frontend, **C#** (.NET) backend. These are new modules to build inside the existing Sondarr app, following its current routing, state, and API conventions.

## About the Design Files
`Sondarr Merch.html` and `Sondarr Sell Merch.html` are **HTML/React design references** — high-fidelity interactive prototypes showing look, feel, layout, and interaction, built as standalone single-file demos with in-memory mock state (no real backend, no persistence). They are **not production code to copy directly**.

Recreate them inside the existing Sondarr React codebase using its real routing (React Router), component structure, and API client — backed by real C# endpoints (contract proposed below). Match the visual output pixel-precisely; implement behavior against real data instead of the mock arrays/`useState` used in the prototypes.

Both files use `<image-slot>` elements (`image-slot.js`) purely as design-time drag-and-drop image placeholders — **do not implement this component in production**. Every `<image-slot id="...">` marks where a real `<img>` (product photo, artist banner) belongs; treat the `id` as a hint for what image goes there.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interaction patterns are all intentional — recreate pixel-precisely. Icons are inline SVG in the prototype; recreate as an icon set/library already used in the app, matching the shapes shown.

## Design Tokens
Shared with the rest of the Sondarr redesign (see the platform's own handoff if available). Reproduced here for this feature:

```
// Backgrounds
--bg-primary:    #0c0e1e
--bg-glass:      rgba(255,255,255,0.03–0.04)
--border:        rgba(255,255,255,0.07–0.09)
--border-gold:   rgba(212,146,14,0.35–0.6)

// Accent — gold/amber
--gold:          #d4920e
--gold-2:        #e8a520
--gold-gradient: linear-gradient(135deg, #d4920e, #e8a520)
--gold-dim-bg:   rgba(212,146,14,0.08–0.18)

// Text
--text:          #f0ebe0
--text-muted:    rgba(240,235,224,0.4–0.55)
--text-dim:      rgba(240,235,224,0.22–0.3)

// Status
--green (earnings/live/success): #4ade80 / rgba(34,197,94,*)
--red (destructive/remove):      #f87171 / rgba(248,113,113,*)

// Typography
--font-heading: 'Syne', sans-serif   (weights 600/700/800)
--font-body:    'DM Sans', sans-serif (weights 300/400/500)

// Radius
Cards/panels: 16–18px | Large containers/banners: 20–24px | Pills/buttons: 999px | Inputs: 10–12px | Icon chips: 8px

// Spacing
Page padding: 40px top, 48px sides | Section gap: ~28–40px | Card grid gap: 18–22px
```

---

## Part 1 — Merch Shop (`Sondarr Merch.html`)

Standalone storefront with its own header (distinct from the main Sondarr app shell — no nav rail/bottom player), linking back to the main app via "← Back to Sondarr".

### Screens

**Header** (sticky, 64px, `rgba(6,8,18,0.9)` blur): Sondarr logo + "MERCH" wordmark tag, nav links (Shop / Collections), "Back to Sondarr" link, cart icon button with item-count badge (gold circle, top-right of icon).

**Shop** — Page title + subtitle. Two filter-chip rows: category (`All / Apparel / Accessories / Vinyl & Media`) and artist (`All Artists` + one chip per artist). Product grid: `grid-template-columns: repeat(4, 1fr)`, 22px gap. Each **ProductCard**: 4:5 image, `border-radius:16px`, hover `translateY(-3px)` + gold border; below image: artist name (10px uppercase dim), product name (Syne 700 15px), price (gold, 14px 600).

**Collections** — Grid of artist banner cards (3 columns, 16:9 image + gradient + name/genre/listener overlay) linking to that artist's filtered shop view.

**Artist Collection page** — 280px-tall banner (artist image + gradient), overlay with genre/listener count, artist name (Syne 800 44px), a **revenue-share badge** ("Artist receives X% of this sale" — green dollar icon, `rgba(34,197,94,0.08)` bg), then a 4-col grid of that artist's products only.

**Product Detail** — Two-column: large 1:1 product image (left) / info panel (right, 420px): category label, title (Syne 800 32px), artist name as a gold link to their collection, price (26px 700), description, size picker (pill buttons, only for apparel), quantity stepper, full-width "Add to Cart" button (gold gradient, black text), revenue-share badge. Below: "More from {Artist}" — 4 related products.

**Cart** — Empty state: bag icon + "Your cart is empty" + Continue Shopping button. Populated: line-item list (thumb, name, artist, size, price, qty stepper, remove ✕) + right-side Order Summary card (subtotal, shipping, total, **"Artists Receive" breakdown per artist** in green, Checkout button).

**Checkout** — Two-column: Shipping fields (name, email, address, city/state/zip) + Payment fields (card number, expiry, CVC) using the icon-left glass-input pattern (`padding:12px 16px 12px 38px`, `border-radius:12px`, glass bg, gold focus border) / right: condensed order summary + total + "Place Order" button.

**Order Confirmation** — Centered success state: green check circle, order number (`SN-#####` format), thank-you copy referencing fair pay, "Continue Shopping" button.

**Footer** — Fair-Pay one-liner with green pulse dot ("75–90% of every sale goes directly to the artist"), copyright, and a link to the Sell Merch flow ("Artist? Sell your merch on Sondarr →").

### Interactions
- Category/artist chip filters are AND-combined client-side (server-side: query params on the products list endpoint).
- Add to Cart appends `{product, size, qty}`; cart badge count = sum of quantities.
- Quantity steppers clamp at minimum 1.
- Checkout "Place Order" clears cart and routes to confirmation (in production: submits an order to the backend first, only clearing/redirecting on success — handle failure with an inline error state, which the prototype does not model).

---

## Part 2 — Sell Merch: Artist Onboarding + Dashboard (`Sondarr Sell Merch.html`)

Same visual system, own header ("SELL MERCH" tag), links to Merch Shop and back to Sondarr. Two modes: **wizard** (first-time setup) and **dashboard** (ongoing management). In production, an artist with zero connected sources always lands in the wizard; once they have ≥1 source they land on the dashboard (wizard reachable again via "Add Product"/"Connect another store").

### Wizard

3-step progress indicator: **Method → Setup → Review**.

1. **Choose Method** — two large option cards: "Connect Shopify" and "Upload products manually."
2. **Shopify path**:
   - **Form**: store URL (`yourstore.myshopify.com`) + Admin API access token (password field), icon-left inputs, disabled "Connect store" button until both filled.
   - **Connecting**: centered spinner + "Connecting to {url}…" (prototype fakes a 1.6s delay — production: poll or await the real OAuth/API handshake).
   - **Sync review**: checklist of products pulled from the store (checkbox + thumb + name + inventory + price), "Finish setup" imports only the checked ones.
3. **Manual path** — **form** (left) + **live running list of added products** (right): name, description (textarea), price, category (select: Apparel/Accessories/Vinyl & Media), inventory count, revenue-share % override (optional, defaults to the artist's platform rate), variant tags (add via text input + Enter, removable chips), two image slots. "+ Add to catalog" appends to the list and resets the form (repeatable for multiple products); "Finish setup" moves to the dashboard once ≥1 product exists.

### Dashboard
- Header row: "Sell Merch" title + live product count, revenue-share badge ("You keep X% · Sondarr fee Y%").
- **Store connection card** (if connected): store domain + green status dot, "Synced {time} · N products imported", **Resync** and **Disconnect** buttons. If not connected: dashed-border prompt card to connect Shopify.
- **Your Products** section header + "Add Product" button (routes into the wizard's manual form).
- Product grid (4 columns): each card shows image, source badge ("Shopify" gold / "Manual" muted + category), name, price, and — for manual products with an override — the custom revenue-share %. Manual cards have a delete (trash) button; Shopify-sourced cards are managed via resync/disconnect, not deleted individually in this version.

### Interactions & state transitions
- `wizard.step`: `choose → shopify-form → shopify-connecting → shopify-sync → (dashboard)` or `choose → manual-form → (dashboard)`.
- Disconnecting Shopify removes all Shopify-sourced products from the dashboard grid (manual products are unaffected).
- Resync re-fetches the store's catalog (production: re-run the sync job; prototype is a no-op stub).
- Revenue-share override, when set, takes precedence over the artist's platform default for that specific product in payout calculations.

---

## Proposed C# / API Contract
The prototype has no backend; this is a suggested shape for the .NET side so the React app has real data to bind to. Adjust to match existing Sondarr API conventions (auth, naming, envelope format) rather than introducing a new style.

**Entities**
- `Product { Id, ArtistId, Source (Shopify|Manual), Name, Description, PriceCents, Currency, Category, Variants[], InventoryCount, RevenueSharePercent? (null = use artist default), ImageUrls[], IsActive }`
- `Artist { Id, Name, DefaultRevenueSharePercent, ShopifyConnection? }`
- `ShopifyConnection { ArtistId, StoreDomain, AccessTokenEncrypted, Status (Connected|Syncing|Error|Disconnected), LastSyncedAt }`
- `Order { Id, BuyerId, Items[{ProductId, VariantLabel, Qty, UnitPriceCents}], SubtotalCents, ShippingCents, TotalCents, Status, PlacedAt }`
- `PayoutLine { OrderId, ArtistId, ProductId, AmountCents, SharePercentApplied }` — generated per order line at checkout time for the "Artists Receive" breakdown and artist earnings history.

**Suggested endpoints**
- `GET /api/products?category=&artistId=` — storefront catalog, filterable.
- `GET /api/products/{id}` — product detail + related products.
- `GET /api/artists/{id}` — artist collection page (banner info, share %, products).
- `POST /api/cart` / `PATCH /api/cart/{itemId}` / `DELETE /api/cart/{itemId}` — cart CRUD (or client-side cart + `POST /api/orders` at checkout, matching however the rest of Sondarr handles carts today).
- `POST /api/orders` — place order; server computes `PayoutLine`s from each product's effective share %.
- `POST /api/artist/shopify/connect` — `{ storeDomain, accessToken }` → validates + kicks off a sync job, returns connection status.
- `GET /api/artist/shopify/sync-preview` — returns the fetched-but-not-yet-imported product list (drives the "Sync review" checklist).
- `POST /api/artist/shopify/import` — `{ productIds[] }` — persists the selected products.
- `POST /api/artist/shopify/resync` / `DELETE /api/artist/shopify/connection` — resync / disconnect.
- `POST /api/artist/products` / `PUT /api/artist/products/{id}` / `DELETE /api/artist/products/{id}` — manual product CRUD.
- `GET /api/artist/products` — dashboard product list (both sources merged, with `Source` field for badge rendering).

Real Shopify integration would use Shopify's Admin API (OAuth app or custom app access token) server-side — never expose the access token to the client; the React form only collects it and the C# backend stores/uses it.

## Assets
All product/artist imagery in the prototypes are empty `<image-slot>` placeholders (no stock photos used) — every image in production is a real uploaded/synced photo. Icons are hand-drawn inline SVG in the prototype files; recreate with the app's existing icon library, matching stroke weight (~1.8px) and rounded style.

## Files in This Package
| File | Purpose |
|---|---|
| `Sondarr Merch.html` | Storefront prototype — Shop, Collections, Artist page, Product detail, Cart, Checkout, Confirmation. Open in browser to inspect. |
| `Sondarr Sell Merch.html` | Artist onboarding wizard + management dashboard prototype. |
| `image-slot.js` | Design-time-only placeholder component used by both prototypes — do not port to production. |
| `screenshots/` | Reference captures of each screen (see below). |

## Screenshots
`screenshots/01-shop.png` — Shop grid with category/artist filters
`screenshots/02-product-detail.png` — Product detail page
`screenshots/03-product-added.png` — Product detail, item added to cart (badge)
`screenshots/04-cart.png` — Cart with line item + Artists Receive breakdown
`screenshots/05-checkout.png` — Cart→Checkout summary state
`screenshots/06-choose-method.png` — Sell Merch wizard: choose Shopify vs manual
`screenshots/07-shopify-form.png` — Shopify store URL / API token form
`screenshots/08-dashboard.png` — Seller dashboard with connected store + product grid
`screenshots/09-manual-form.png` — Manual product upload form (top)
