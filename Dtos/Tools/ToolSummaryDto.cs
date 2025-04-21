namespace IT_Tools.Dtos.Tools;

public class ToolSummaryDto
{
    public int ToolId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? CategoryName { get; set; }
    public bool IsPremium { get; set; }
}