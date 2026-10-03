using System.ComponentModel.DataAnnotations;

namespace IT_Tools.Dtos.Admin;

public class ProcessUpgradeRequestDto
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$", ErrorMessage = "Status must be 'Approved' or 'Rejected'.")] // Validate input
    public string NewStatus { get; set; } = string.Empty;
}