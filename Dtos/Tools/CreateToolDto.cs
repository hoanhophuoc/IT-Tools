using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Tools;

public class CreateToolDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string? Description { get; set; }

    [Required]
    public string? CategoryName { get; set; }

    [Required]
    public string ComponentUrl { get; set; } = string.Empty;

    [Required]
    public string? Icon { get; set; }

    public bool IsPremium { get; set; } = false;

    public bool IsEnabled { get; set; } = true;
}
