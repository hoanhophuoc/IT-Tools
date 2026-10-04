using IT_Tools.Data;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Xunit;

namespace IT_Tools.Tests;

public class AuthServiceTests
{
    private static PostgreSQLContext CreateInMemoryContext(string dbName)
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
    public async Task RegisterAsync_NewUser_CreatesUserWithHashedPassword()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_NewUser_CreatesUserWithHashedPassword));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        var dto = new RegisterRequestDto
        {
            Username = "johndoe",
            Password = "Password123!"
        };

        var user = await authService.RegisterAsync(dto);

        Assert.NotNull(user);
        Assert.Equal("johndoe", user.Username);
        Assert.Equal("User", user.Role);
        Assert.True(BCrypt.Net.BCrypt.Verify("Password123!", user.Password));

        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "johndoe");
        Assert.NotNull(dbUser);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateUsername_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(RegisterAsync_DuplicateUsername_ReturnsNull));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        var dto1 = new RegisterRequestDto { Username = "alice", Password = "Pass1" };
        var dto2 = new RegisterRequestDto { Username = "alice", Password = "Pass2" };

        var user1 = await authService.RegisterAsync(dto1);
        var user2 = await authService.RegisterAsync(dto2);

        Assert.NotNull(user1);
        Assert.Null(user2);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsLoginResponseWithJwtToken()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_ValidCredentials_ReturnsLoginResponseWithJwtToken));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        await authService.RegisterAsync(new RegisterRequestDto { Username = "bob", Password = "BobPassword!" });

        var response = await authService.LoginAsync(new LoginRequestDto { Username = "bob", Password = "BobPassword!" });

        Assert.NotNull(response);
        Assert.Equal("bob", response.Username);
        Assert.NotNull(response.Token);
        Assert.NotEmpty(response.Token);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_InvalidPassword_ReturnsNull));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        await authService.RegisterAsync(new RegisterRequestDto { Username = "charlie", Password = "CorrectPassword" });

        var response = await authService.LoginAsync(new LoginRequestDto { Username = "charlie", Password = "WrongPassword" });

        Assert.Null(response);
    }

    [Fact]
    public async Task ChangePasswordAsync_ValidOldPassword_UpdatesPasswordSuccessfully()
    {
        using var context = CreateInMemoryContext(nameof(ChangePasswordAsync_ValidOldPassword_UpdatesPasswordSuccessfully));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        await authService.RegisterAsync(new RegisterRequestDto { Username = "david", Password = "OldPassword123" });

        var success = await authService.ChangePasswordAsync(new ChangePasswordRequestDto
        {
            Username = "david",
            OldPassword = "OldPassword123",
            NewPassword = "NewSecretPassword!"
        });

        Assert.True(success);

        // Verify login with new password succeeds
        var loginResponse = await authService.LoginAsync(new LoginRequestDto
        {
            Username = "david",
            Password = "NewSecretPassword!"
        });
        Assert.NotNull(loginResponse);
    }

    [Fact]
    public async Task ChangePasswordAsync_IncorrectOldPassword_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(ChangePasswordAsync_IncorrectOldPassword_ReturnsFalse));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        await authService.RegisterAsync(new RegisterRequestDto { Username = "eve", Password = "RealPassword" });

        var success = await authService.ChangePasswordAsync(new ChangePasswordRequestDto
        {
            Username = "eve",
            OldPassword = "IncorrectPassword",
            NewPassword = "AnotherPassword"
        });

        Assert.False(success);
    }

    [Fact]
    public async Task ChangePasswordAsync_NonExistentUser_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(ChangePasswordAsync_NonExistentUser_ReturnsFalse));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        var success = await authService.ChangePasswordAsync(new ChangePasswordRequestDto
        {
            Username = "nonexistent",
            OldPassword = "OldPassword",
            NewPassword = "NewPassword"
        });

        Assert.False(success);
    }

    [Fact]
    public async Task HandleForgotPasswordAsync_ExistingUser_ResetsPasswordSuccessfully()
    {
        using var context = CreateInMemoryContext(nameof(HandleForgotPasswordAsync_ExistingUser_ResetsPasswordSuccessfully));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        await authService.RegisterAsync(new RegisterRequestDto { Username = "frank", Password = "OriginalPassword" });

        var success = await authService.HandleForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Username = "frank",
            NewPassword = "ResetPassword123!"
        });

        Assert.True(success);

        // Verify login succeeds with the reset password
        var loginResponse = await authService.LoginAsync(new LoginRequestDto
        {
            Username = "frank",
            Password = "ResetPassword123!"
        });
        Assert.NotNull(loginResponse);
    }

    [Fact]
    public async Task HandleForgotPasswordAsync_NonExistentUser_ReturnsFalse()
    {
        using var context = CreateInMemoryContext(nameof(HandleForgotPasswordAsync_NonExistentUser_ReturnsFalse));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        var success = await authService.HandleForgotPasswordAsync(new ForgotPasswordRequestDto
        {
            Username = "ghost_user",
            NewPassword = "AnyPassword"
        });

        Assert.False(success);
    }

    [Fact]
    public async Task LoginAsync_NonExistentUser_ReturnsNull()
    {
        using var context = CreateInMemoryContext(nameof(LoginAsync_NonExistentUser_ReturnsNull));
        var jwtService = CreateJwtTokenService();
        var authService = new AuthService(context, jwtService);

        var response = await authService.LoginAsync(new LoginRequestDto
        {
            Username = "no_such_user",
            Password = "password"
        });

        Assert.Null(response);
    }
}
