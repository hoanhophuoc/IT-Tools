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
        // Kiểm tra username tồn tại
        if (await context.Users.AnyAsync(u => u.Username == registerDto.Username))
        {
            return null;
        }

        // Map DTO sang User, bỏ qua PasswordHash và Role
        var newUser = mapper.Map<User>(registerDto);

        // Hash password và gán Role
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
            return null; // Sai username hoặc password
        }

        // Tạo token
        var token = jwtTokenService.GenerateToken(user);

        // Map User sang LoginResponseDto và gán token
        var response = mapper.Map<LoginResponseDto>(user);
        response.Token = token;

        return response;
    }
}