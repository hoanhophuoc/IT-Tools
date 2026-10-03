using BCryptNet = BCrypt.Net.BCrypt;
using IT_Tools.Data;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class AuthService(PostgreSQLContext context, JwtTokenService jwtTokenService)
{
    public async Task<User?> RegisterAsync(RegisterRequestDto registerDto)
    {
        if (await context.Users.AnyAsync(u => u.Username == registerDto.Username))
        {
            return null;
        }

        var newUser = new User
        {
            Username = registerDto.Username,
            Password = BCryptNet.HashPassword(registerDto.Password),
            Role = "User",
            CreatedAt = DateTime.UtcNow,
        };

        await context.Users.AddAsync(newUser);
        await context.SaveChangesAsync();

        return newUser;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null || !BCryptNet.Verify(loginDto.Password, user.Password))
        {
            return null;
        }

        var token = jwtTokenService.GenerateToken(user);

        return new LoginResponseDto
        {
            UserId = user.UserId,
            Username = user.Username,
            Role = user.Role,
            Token = token,
        };
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequestDto changePasswordDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == changePasswordDto.Username);

        if (user == null)
        {
            return false;
        }

        if (!BCryptNet.Verify(changePasswordDto.OldPassword, user.Password))
        {
            return false;
        }

        user.Password = BCryptNet.HashPassword(changePasswordDto.NewPassword);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> HandleForgotPasswordAsync(ForgotPasswordRequestDto forgotPasswordDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == forgotPasswordDto.Username);

        if (user == null)
        {
            return false;
        }

        user.Password = BCryptNet.HashPassword(forgotPasswordDto.NewPassword);
        await context.SaveChangesAsync();

        return true;
    }
}