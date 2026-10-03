using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace IT_Tools.Dtos.User;

public class CreateUpgradeRequestDto
{
    [Required]
    [JsonRequired]
    public required int UserId { get; set; }
}
