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

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "IT-Tools.dll"]
