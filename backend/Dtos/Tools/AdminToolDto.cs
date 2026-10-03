namespace IT_Tools.Dtos.Tools;

public class AdminToolDto : ToolSummaryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string ComponentUrl { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}