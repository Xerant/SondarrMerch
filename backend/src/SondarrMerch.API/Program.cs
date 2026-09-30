using Serilog;
using SondarrMerch.Core.Interfaces;
using SondarrMerch.Core.Services;
using SondarrMerch.Providers.Shopify;

var builder = WebApplication.CreateBuilder(args);

// ── Logging ───────────────────────────────────────────────────────────────────
builder.Host.UseSerilog((ctx, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration).WriteTo.Console());

// ── CORS — allow Sondarr frontend + StreamingService + Merch frontend ────────
builder.Services.AddCors(o => o.AddPolicy("SondarrFrontend", p =>
    p.WithOrigins(
        builder.Configuration["AllowedOrigins:Frontend"] ?? "http://localhost:5173",
        builder.Configuration["AllowedOrigins:Backend"] ?? "http://localhost:5000",
        builder.Configuration["AllowedOrigins:MerchFrontend"] ?? "http://localhost:5174")
     .AllowAnyHeader()
     .AllowAnyMethod()));

// ── Auth — reuse same Supabase JWT as StreamingService ────────────────────────
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Supabase:Url"];
        o.Audience = "authenticated";
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

app.UseSwagger();
app.UseSwaggerUI();
app.UseSerilogRequestLogging();
app.UseCors("SondarrFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "SondarrMerch" }));

app.Run();
