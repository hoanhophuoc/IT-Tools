using IT_Tools.Dtos.Auth;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")] // Route: /api/auth
public class AuthController(AuthService authService) : ControllerBase
{
    /// <summary>
    /// Đăng ký một tài khoản người dùng mới.
    /// </summary>
    /// <param name="registerDto">Thông tin đăng ký (username, password).</param>
    /// <returns>Thông báo thành công hoặc lỗi.</returns>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
    {
        // Kiểm tra validation cơ bản (như là [Required] trong DTO)
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdUser = await authService.RegisterAsync(registerDto);

        return createdUser == null
            ? BadRequest(new { message = "Username already exists." })
            : Ok(new { message = "User registered successfully." });
    }

    /// <summary>
    /// Đăng nhập và lấy JWT token.
    /// </summary>
    /// <param name="loginDto">Thông tin đăng nhập (username, password).</param>
    /// <returns>JWT token và thông tin user nếu thành công, hoặc lỗi nếu thất bại.</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var loginResponse = await authService.LoginAsync(loginDto);

        return loginResponse == null ? Unauthorized(new { message = "Invalid username or password." }) : Ok(loginResponse);
    }

    /// <summary>
    /// Thay đổi mật khẩu cho người dùng đã đăng nhập.
    /// </summary>
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto changePasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var result = await authService.ChangePasswordAsync(changePasswordDto);
        return !result
            ? Unauthorized(new { message = "Invalid old password or user not found." })
            : Ok(new { message = "Password changed successfully." });
    }

    /// <summary>
    /// Khôi phục mật khẩu cho người dùng.
    /// </summary>
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto forgotPasswordDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var result = await authService.HandleForgotPasswordAsync(forgotPasswordDto);
        return !result ? Unauthorized(new { message = "User not found." }) : Ok(new { message = "Password reset successfully." });
    }
}