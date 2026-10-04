using IT_Tools.Controllers;
using IT_Tools.Data;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Xunit;

namespace IT_Tools.Tests;

public class AuthControllerTests
{
    private static PostgreSQLContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PostgreSQLContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PostgreSQLContext(options);
    }

    private static JwtTokenService CreateJwtTokenService()
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = "SuperSecureSecretKeyThatIsAtLeast32BytesLong!",
            ExpiryMinutes = 60,
            Issuer = "IT-Tools-Issuer",
            Audience = "IT-Tools-Audience"
        });
        return new JwtTokenService(settings);
    }

    [Fact]
    public async Task Register_ValidDto_ReturnsOk()
    {
        using var context = CreateContext(nameof(Register_ValidDto_ReturnsOk));
        var authService = new AuthService(context, CreateJwtTokenService());
        var controller = new AuthController(authService);

        var request = new RegisterRequestDto
        {
            Username = "newbie",
            Password = "SecurePassword123"
        };

        var result = await controller.Register(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task Register_DuplicateUsername_ReturnsBadRequest()
    {
        using var context = CreateContext(nameof(Register_DuplicateUsername_ReturnsBadRequest));
        context.Users.Add(new User
        {
            UserId = 1,
            Username = "existing",
            Password = BCrypt.Net.BCrypt.HashPassword("Pass123"),
            Role = "User"
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var authService = new AuthService(context, CreateJwtTokenService());
        var controller = new AuthController(authService);

        var request = new RegisterRequestDto
        {
            Username = "existing",
            Password = "SecurePassword123"
        };

        var result = await controller.Register(request);

        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badResult.Value);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        using var context = CreateContext(nameof(Login_ValidCredentials_ReturnsOkWithToken));
        context.Users.Add(new User
        {
            UserId = 2,
            Username = "validuser",
            Password = BCrypt.Net.BCrypt.HashPassword("ValidPassword123!"),
            Role = "User"
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var authService = new AuthService(context, CreateJwtTokenService());
        var controller = new AuthController(authService);

        var request = new LoginRequestDto
        {
            Username = "validuser",
            Password = "ValidPassword123!"
        };

        var result = await controller.Login(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<LoginResponseDto>(okResult.Value);
        Assert.NotNull(response.Token);
        Assert.Equal("validuser", response.Username);
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        using var context = CreateContext(nameof(Login_InvalidPassword_ReturnsUnauthorized));
        context.Users.Add(new User
        {
            UserId = 3,
            Username = "targetuser",
            Password = BCrypt.Net.BCrypt.HashPassword("RealPassword!"),
            Role = "User"
        });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var authService = new AuthService(context, CreateJwtTokenService());
        var controller = new AuthController(authService);

        var request = new LoginRequestDto
        {
            Username = "targetuser",
            Password = "WrongPassword!"
        };

        var result = await controller.Login(request);

        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.NotNull(unauthorizedResult.Value);
    }

    [Fact]
    public async Task ForgotPassword_NonExistentUser_ReturnsUnauthorized()
    {
        using var context = CreateContext(nameof(ForgotPassword_NonExistentUser_ReturnsUnauthorized));
        var authService = new AuthService(context, CreateJwtTokenService());
        var controller = new AuthController(authService);

        var request = new ForgotPasswordRequestDto
        {
            Username = "ghost_user",
            NewPassword = "NewSecretPassword123!"
        };

        var result = await controller.ForgotPassword(request);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
