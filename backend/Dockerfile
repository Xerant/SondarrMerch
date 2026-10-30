# Build context: SondarrMerch/backend

# Stage 1: build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Sondarr.Auth.Shared lives on GitHub Packages, which requires auth even to
# read. Pass a classic PAT with read:packages as a build arg (DigitalOcean:
# BUILD_TIME env var of the same name). Build stage only — never reaches the
# runtime image.
ARG NUGET_GITHUB_USER=Xerant
ARG NUGET_GITHUB_TOKEN

COPY nuget.config ./
COPY src/SondarrMerch.API/SondarrMerch.API.csproj src/SondarrMerch.API/
COPY src/SondarrMerch.Core/SondarrMerch.Core.csproj src/SondarrMerch.Core/
COPY src/SondarrMerch.Providers.Shopify/SondarrMerch.Providers.Shopify.csproj src/SondarrMerch.Providers.Shopify/
RUN if [ -z "$NUGET_GITHUB_TOKEN" ]; then \
      echo "ERROR: NUGET_GITHUB_TOKEN build arg is not set (needs a read:packages PAT to restore Sondarr.Auth.Shared)." >&2; \
      exit 1; \
    fi \
    && NuGetPackageSourceCredentials_github="Username=$NUGET_GITHUB_USER;Password=$NUGET_GITHUB_TOKEN" \
       dotnet restore src/SondarrMerch.API/SondarrMerch.API.csproj

# Restore is done; publish must not re-restore (no GitHub credential here).
COPY src/ src/
RUN dotnet publish src/SondarrMerch.API/SondarrMerch.API.csproj -c Release -o /app/publish --no-restore

# Stage 2: runtime (listens on 8080)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SondarrMerch.API.dll"]
