using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Auth;

public class RegisterRequestDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;
}
