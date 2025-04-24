using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Auth;

public class ForgotPasswordRequestDto
{
    [Required]
    public string Username { get; set; } = string.Empty; // Tên đăng nhập của người dùng
    [Required]
    public string NewPassword { get; set; } = string.Empty; // Mật khẩu mới
}
