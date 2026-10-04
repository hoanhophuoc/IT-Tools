using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.Extensions.Options;
using Xunit;

namespace IT_Tools.Tests;

public class JwtTokenServiceTests
{
    private static JwtTokenService CreateService(string secret = "SuperSecretKeyForTestingPurposes1234567890!",
        int expiryMinutes = 60,
        string issuer = "IT-Tools-Issuer",
        string audience = "IT-Tools-Audience")
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = secret,
            ExpiryMinutes = expiryMinutes,
            Issuer = issuer,
            Audience = audience
        });
        return new JwtTokenService(settings);
    }

    [Fact]
    public void GenerateToken_ValidUser_ReturnsValidJwtToken()
    {
        var service = CreateService();
        var user = new User
        {
            UserId = 42,
            Username = "testuser",
            Role = "Admin"
        };

        var tokenString = service.GenerateToken(user);

        Assert.NotNull(tokenString);
        Assert.NotEmpty(tokenString);

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(tokenString);

        Assert.Equal("IT-Tools-Issuer", token.Issuer);
        Assert.Contains(token.Audiences, a => a == "IT-Tools-Audience");

        var userIdClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid");
        Assert.NotNull(userIdClaim);
        Assert.Equal("42", userIdClaim.Value);

        var userClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name || c.Type == "unique_name");
        Assert.NotNull(userClaim);
        Assert.Equal("testuser", userClaim.Value);

        var roleClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        Assert.NotNull(roleClaim);
        Assert.Equal("Admin", roleClaim.Value);
    }

    [Fact]
    public void GenerateToken_NullUser_ThrowsArgumentNullException()
    {
        var service = CreateService();
        Assert.Throws<ArgumentNullException>(() => service.GenerateToken(null!));
    }

    [Theory]
    [InlineData("", "issuer", "audience")]
    [InlineData("secret", "", "audience")]
    [InlineData("secret", "issuer", "")]
    public void Constructor_MissingSettings_ThrowsInvalidOperationException(string secret, string issuer, string audience)
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = secret,
            ExpiryMinutes = 60,
            Issuer = issuer,
            Audience = audience
        });

        Assert.Throws<InvalidOperationException>(() => new JwtTokenService(settings));
    }
}
