using IT_Tools.Data;
using IT_Tools.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// --- CORS ---
var frontendUrl = configuration["AppSettings:FrontendBaseUrl"] ?? "http://localhost:3000";
builder.Services.AddCors(options => options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy => policy.WithOrigins(frontendUrl)
                                .AllowAnyHeader()
                                .AllowAnyMethod()));

// --- DbContext ---
builder.Services.AddDbContextPool<PostgreSQLContext>(opt =>
    opt.UseNpgsql(configuration.GetConnectionString("PostgreSQLContext")));

// --- Authentication & Authorization ---
var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT Settings missing");
if (string.IsNullOrEmpty(jwtSettings.Secret))
{
    jwtSettings.Secret = Environment.GetEnvironmentVariable("JWT_SECRET")
        ?? (builder.Environment.IsDevelopment()
            ? "development_fallback_secret_key_minimum_length_for_hmacsha256_at_least_32_bytes_long"
            : throw new InvalidOperationException("JWT Secret is not configured."));
}
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

// --- Services ---
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.Configure<JwtSettings>(opt =>
{
    opt.Secret = jwtSettings.Secret;
    opt.ExpiryMinutes = jwtSettings.ExpiryMinutes;
    opt.Issuer = jwtSettings.Issuer;
    opt.Audience = jwtSettings.Audience;
});
builder.Services.AddScoped<ToolService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<FavoriteService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "IT-Tools API v1");
    c.RoutePrefix = "swagger";
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/healthz", () => Results.Ok("OK"));

await app.RunAsync();