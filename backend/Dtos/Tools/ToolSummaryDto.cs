namespace IT_Tools.Dtos.Tools;

public class ToolSummaryDto
{
    public int ToolId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public bool IsPremium { get; set; }
    public bool IsFavorite { get; set; } = false;
}