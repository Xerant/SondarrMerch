using Microsoft.AspNetCore.Authentication.JwtBearer;
using Serilog;
using Sondarr.Auth.Shared;
using SondarrMerch.Core.Interfaces;
using SondarrMerch.Core.Services;
using SondarrMerch.Providers.Shopify;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ───────────────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// ── CORS — the Merch storefront only. Credentials are on for the shared
// .sondarr.com session cookie, so origins must be explicit. ───────────────────
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>();
if (corsOrigins is not { Length: > 0 })
    throw new InvalidOperationException("CORS origins not configured. Set Cors:Origins (env Cors__Origins__0).");

builder.Services.AddCors(o => o.AddPolicy("SondarrFrontend", p =>
    p.WithOrigins(corsOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

// ── Auth — Sondarr.Auth.Shared: Supabase JWT (JWKS, issuer + audience) from the
// Authorization header, falling back to the shared .sondarr.com cookie. ───────
// The issuer is always {Url}/auth/v1, so derive it rather than require a second setting.
var supabaseUrl = builder.Configuration["Supabase:Url"]?.Trim().TrimEnd('/');
if (string.IsNullOrEmpty(supabaseUrl))
    throw new InvalidOperationException("Supabase:Url is not configured.");
if (string.IsNullOrEmpty(builder.Configuration["Supabase:Issuer"]))
    builder.Configuration["Supabase:Issuer"] = $"{supabaseUrl}/auth/v1";

builder.Services.AddSupabaseAuthentication(builder.Configuration);
builder.Services.AddSondarrAuthServices();

// Keep raw JWT claim names ("sub", "email", "user_role"); UserContext.FromClaims
// reads those. Remove once Sondarr.Auth.Shared sets this itself.
builder.Services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
{
    options.MapInboundClaims = false;
});
builder.Services.AddAuthorization();

// ── Commerce provider — swap binding here to change platforms ─────────────────
// Shopify → Storefront GraphQL. WooCommerce / custom → implement ICommerceProvider and register.
builder.Services.Configure<ShopifySettings>(
    builder.Configuration.GetSection(ShopifySettings.Section));
builder.Services.AddHttpClient<ShopifyCommerceProvider>();
builder.Services.AddScoped<ICommerceProvider, ShopifyCommerceProvider>();

builder.Services.AddScoped<MerchService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Sondarr Merch API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Supabase JWT — same token used by the main Sondarr API."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseCors("SondarrFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// POST /api/auth/session (Supabase token → HttpOnly cookie on Supabase:Cookie:Domain)
// and POST /api/auth/logout — so a sign-in here carries to the other Sondarr sites.
app.MapSondarrSessionEndpoints(app.Configuration, basePath: "/api/auth");
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "SondarrMerch" }));

app.Run();
