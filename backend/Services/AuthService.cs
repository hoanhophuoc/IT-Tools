using AutoMapper;
using IT_Tools.Data;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class AuthService(PostgreSQLContext context, IMapper mapper, PasswordHasherService passwordHasher, JwtTokenService jwtTokenService)
{
    public async Task<User?> RegisterAsync(RegisterRequestDto registerDto)
    {
        if (await context.Users.AnyAsync(u => u.Username == registerDto.Username))
        {
            return null;
        }

        var newUser = mapper.Map<User>(registerDto);

        newUser.Password = passwordHasher.HashPassword(registerDto.Password);

        await context.Users.AddAsync(newUser);
        await context.SaveChangesAsync();

        return newUser;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null || !passwordHasher.VerifyPassword(loginDto.Password, user.Password))
        {
            return null;
        }

        var token = jwtTokenService.GenerateToken(user);

        var response = mapper.Map<LoginResponseDto>(user);
        response.Token = token;

        return response;
    }

    public async Task<bool> ChangePasswordAsync(ChangePasswordRequestDto changePasswordDto)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Username == changePasswordDto.Username);

        if (user == null)
        {
            return false;
        }

        if (!passwordHasher.VerifyPassword(changePasswordDto.OldPassword, user.Password))
        {
            return false;
        }

        user.Password = passwordHasher.HashPassword(changePasswordDto.NewPassword);
        context.Users.Update(user);
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

        user.Password = passwordHasher.HashPassword(forgotPasswordDto.NewPassword);
        context.Users.Update(user);
        await context.SaveChangesAsync();

        return true;
    }
}