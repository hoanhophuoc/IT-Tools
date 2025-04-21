using IT_Tools.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IT_Tools.Services;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; }
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
}

public class JwtTokenService
{
    private readonly JwtSettings _jwtSettings;

    // Inject IOptions<JwtSettings> để lấy cấu hình từ appsettings.json
    public JwtTokenService(IOptions<JwtSettings> jwtSettings)
    {
        // Lấy giá trị cấu hình thực tế
        _jwtSettings = jwtSettings.Value ?? throw new ArgumentNullException(nameof(jwtSettings), "JWT Settings cannot be null.");

        // Kiểm tra cấu hình tối thiểu
        if (string.IsNullOrEmpty(_jwtSettings.Secret))
        {
            throw new InvalidOperationException("JWT Secret key is not configured.");
        }
        if (string.IsNullOrEmpty(_jwtSettings.Issuer))
        {
            throw new InvalidOperationException("JWT Issuer is not configured.");
        }
        if (string.IsNullOrEmpty(_jwtSettings.Audience))
        {
            throw new InvalidOperationException("JWT Audience is not configured.");
        }
    }

    public string GenerateToken(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret); // Chuyển Secret thành byte array

        // Định nghĩa các Claims (thông tin nhúng vào token)
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()), // Subject = User ID (chuẩn JWT)
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // JWT ID - ID duy nhất cho token này
            new(JwtRegisteredClaimNames.Name, user.Username), // Tên user (chuẩn JWT)
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()), // Một cách khác để lưu User ID
            new(ClaimTypes.Name, user.Username), // Một cách khác để lưu Username
            new(ClaimTypes.Role, user.Role) // Vai trò của user
        };

        // Tạo thông tin chữ ký
        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature);

        // Tạo đối tượng mô tả token
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims), // Danh sách claims
            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes), // Thời gian hết hạn
            Issuer = _jwtSettings.Issuer, // Người phát hành
            Audience = _jwtSettings.Audience, // Đối tượng sử dụng
            SigningCredentials = creds // Thông tin chữ ký
        };

        // Tạo token
        var token = tokenHandler.CreateToken(tokenDescriptor);

        // Chuyển token thành chuỗi string để trả về
        return tokenHandler.WriteToken(token);
    }
}