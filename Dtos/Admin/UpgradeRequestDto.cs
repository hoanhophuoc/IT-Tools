namespace IT_Tools.Dtos.Admin;

public class UpgradeRequestDto
{
    public int RequestId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty; // Include username for clarity
    public string Status { get; set; } = string.Empty;
    public DateTime RequestedAt { get; set; }
}
