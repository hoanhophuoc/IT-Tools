using IT_Tools.Data;
using IT_Tools.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration; // Lấy configuration

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins"; // Đặt tên cho policy CORS

// --- CẤU HÌNH CORS SERVICES ---
builder.Services.AddCors(options => options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy => policy.WithOrigins("http://localhost:3000") // Frontend dev URL
                                .AllowAnyHeader()
                                .AllowAnyMethod()));
// -----------------------------------------

// --- Đăng ký các Services khác ---
// DbContext
builder.Services.AddDbContextPool<PostgreSQLContext>(opt =>
    opt.UseNpgsql(configuration.GetConnectionString("PostgreSQLContext")));

// AutoMapper
builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly());

// Authentication & Authorization
var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT Settings missing");
var key = Encoding.ASCII.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
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
        ClockSkew = TimeSpan.Zero // Đặt để không cho phép chênh lệch thời gian
    };
});
builder.Services.AddAuthorization(); // Đăng ký Authorization (cần thiết để phân quyền theo Role)

// Services nghiệp vụ
builder.Services.AddScoped<PasswordHasherService>();
builder.Services.AddSingleton<JwtTokenService>(); // Singleton phù hợp vì JwtTokenService chỉ phụ thuộc vào cấu hình không đổi
builder.Services.Configure<JwtSettings>(configuration.GetSection("JwtSettings")); // Cấu hình để inject IOptions<JwtSettings>
builder.Services.AddScoped<ToolService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<UserService>();
// -----------------------------------

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

//---------------------------------------------------------------------
var app = builder.Build();
//---------------------------------------------------------------------

app.UseHttpsRedirection(); // Đặt trước CORS và Auth

// *** SỬ DỤNG CORS MIDDLEWARE ***
// Sử dụng policy đã định nghĩa bằng tên
app.UseCors(MyAllowSpecificOrigins);
// --------------------------------------

// Authentication & Authorization Middleware (Thứ tự quan trọng)
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();