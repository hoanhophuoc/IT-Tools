using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.User;

public class CreateUpgradeRequestDto
{
    [Required]
    public int UserId { get; set; }
}
