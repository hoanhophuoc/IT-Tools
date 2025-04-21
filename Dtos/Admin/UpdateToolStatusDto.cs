using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Admin;

public class UpdateToolStatusDto
{
    [Required]
    public bool IsEnabled { get; set; }

    [Required]
    public bool IsPremium { get; set; }
}
