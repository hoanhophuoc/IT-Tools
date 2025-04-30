namespace IT_Tools.Dtos.Tools;

public class UpdateToolDto
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? CategoryName { get; set; }

    public string ComponentUrl { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public bool IsPremium { get; set; } = false;

    public bool IsEnabled { get; set; } = true;
}
