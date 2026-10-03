FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["IT-Tools.csproj", "./"]
RUN dotnet restore "./IT-Tools.csproj"

COPY . .
RUN dotnet publish "./IT-Tools.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5145
ENV ASPNETCORE_URLS=http://+:5145

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
USER $APP_UID

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5145/healthz || exit 1

ENTRYPOINT ["dotnet", "IT-Tools.dll"]
