using IT_Tools.Dtos.Tools;

namespace IT_Tools.Dtos.Categories;

public class CategoryWithToolsDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<ToolSummaryDto> Tools { get; set; } = [];
}