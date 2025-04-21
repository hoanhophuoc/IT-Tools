using IT_Tools.Dtos.Tools;
public class ToolDetailsDto : ToolSummaryDto
{
    public string? Description { get; set; }
    public string ComponentUrl { get; set; } = string.Empty;
}