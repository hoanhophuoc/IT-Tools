using IT_Tools.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Text;

namespace IT_Tools.Services;

public static class ServiceManager
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure the DbContext with a connection string
        services.AddDbContextPool<PostgreSQLContext>(opt =>
            opt.UseNpgsql(configuration.GetConnectionString("PostgreSQLContext")));

        // Configure AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        // Scoped phù hợp vì PasswordHasher không có state nhưng có thể được dùng bởi service Scoped khác
        services.AddScoped<PasswordHasherService>();

        // Add JWT Authentication configuration
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new InvalidOperationException("JWT Settings section is missing or invalid in configuration.");

        if (string.IsNullOrEmpty(jwtSettings.Secret))
        {
            throw new InvalidOperationException("JWT Secret key is not configured.");
        }
        var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

        services.AddAuthentication(options =>
        {
            // Đặt scheme mặc định là JwtBearer
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options => // Cấu hình cách xử lý JWT Bearer Token
        {
            options.SaveToken = true; // Lưu token vào AuthenticationProperties sau khi xác thực thành công
            options.RequireHttpsMetadata = false; // Đặt thành true trong production nếu dùng HTTPS
            options.TokenValidationParameters = new TokenValidationParameters()
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true, // Kiểm tra token hết hạn
                ValidateIssuerSigningKey = true, // kiểm tra chữ ký
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key), // Key dùng để kiểm tra chữ ký
                ClockSkew = TimeSpan.Zero // Có thể đặt để không cho phép chênh lệch thời gian
            };
        });

        // Đăng ký Authorization (cần thiết để phân quyền theo Role)
        services.AddAuthorization();

        // Singleton phù hợp vì JwtTokenService chỉ phụ thuộc vào cấu hình không đổi
        services.AddSingleton<JwtTokenService>();
        // Cấu hình để inject IOptions<JwtSettings>
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        services.AddScoped<ToolService>();
        services.AddScoped<AuthService>();
        services.AddScoped<AdminService>();

        return services;
    }
}
