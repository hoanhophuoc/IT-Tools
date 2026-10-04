using System.IdentityModel.Tokens.Jwt;
using System.Text;
using BCrypt.Net;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace IT_Tools.Tests;

public class SecurityAndValidationTests
{
    [Fact]
    public void PasswordHashing_SecurityAttributes_ValidatesCorrectly()
    {
        string rawPassword = "StrongPassword@2026!";
        string hash = BCrypt.Net.BCrypt.HashPassword(rawPassword);

        // Verify valid password succeeds
        Assert.True(BCrypt.Net.BCrypt.Verify(rawPassword, hash));

        // Verify wrong password fails
        Assert.False(BCrypt.Net.BCrypt.Verify("WrongPassword!123", hash));

        // Verify salt makes hashes of same password distinct
        string secondHash = BCrypt.Net.BCrypt.HashPassword(rawPassword);
        Assert.NotEqual(hash, secondHash);
    }

    [Fact]
    public void JwtToken_SignatureTampering_FailsValidation()
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = "OriginalSecretKeyMustBe32CharactersLong!",
            ExpiryMinutes = 30,
            Issuer = "IT-Tools-Issuer",
            Audience = "IT-Tools-Audience"
        });
        var service = new JwtTokenService(settings);

        var tokenString = service.GenerateToken(new User
        {
            UserId = 1,
            Username = "legitUser",
            Role = "User"
        });

        // Attempt to validate with forged secret key
        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes("TamperedSecretKeyMustBe32CharsLong!!")),
            ValidateIssuer = true,
            ValidIssuer = "IT-Tools-Issuer",
            ValidateAudience = true,
            ValidAudience = "IT-Tools-Audience",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        Assert.ThrowsAny<SecurityTokenException>(() =>
        {
            tokenHandler.ValidateToken(tokenString, validationParams, out _);
        });
    }

    [Fact]
    public void JwtToken_ExpiredToken_FailsValidation()
    {
        var key = Encoding.ASCII.GetBytes("OriginalSecretKeyMustBe32CharactersLong!");
        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity([new System.Security.Claims.Claim("sub", "expiredUser")]),
            NotBefore = DateTime.UtcNow.AddMinutes(-10),
            Expires = DateTime.UtcNow.AddMinutes(-5),
            Issuer = "IT-Tools-Issuer",
            Audience = "IT-Tools-Audience",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        var validationParams = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = "IT-Tools-Issuer",
            ValidateAudience = true,
            ValidAudience = "IT-Tools-Audience",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        Assert.Throws<SecurityTokenExpiredException>(() =>
        {
            tokenHandler.ValidateToken(tokenString, validationParams, out _);
        });
    }
}
