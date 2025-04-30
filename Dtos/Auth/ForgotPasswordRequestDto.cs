using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Auth;

public class ForgotPasswordRequestDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
