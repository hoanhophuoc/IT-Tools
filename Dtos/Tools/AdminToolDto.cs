namespace IT_Tools.Dtos.Tools;

public class AdminToolDto : ToolSummaryDto
{
    public string? Description { get; set; }
    public string ComponentUrl { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}