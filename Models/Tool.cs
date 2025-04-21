namespace IT_Tools.Models;

/// <summary>
/// Bảng lưu trữ thông tin về các công cụ IT
/// </summary>
public partial class Tool
{
    /// <summary>
    /// ID định danh duy nhất cho mỗi công cụ
    /// </summary>
    public int ToolId { get; set; }

    /// <summary>
    /// Tên của công cụ, phải là duy nhất
    /// </summary>
    public string Name { get; set; } = null!;

    /// <summary>
    /// Mô tả chi tiết về công cụ
    /// </summary>
    public string Description { get; set; } = null!;

    /// <summary>
    /// Khóa ngoại liên kết đến bảng category
    /// </summary>
    public int? CategoryId { get; set; }

    /// <summary>
    /// Trạng thái kích hoạt của công cụ (true: hoạt động, false: không hoạt động)
    /// </summary>
    public bool IsEnabled { get; set; }

    /// <summary>
    /// Đánh dấu công cụ có phải là premium hay không (true: premium, false: miễn phí)
    /// </summary>
    public bool IsPremium { get; set; }

    /// <summary>
    /// Đường dẫn tới component ReactJS tương ứng với công cụ, phải là duy nhất
    /// </summary>
    public string ComponentUrl { get; set; } = null!;

    /// <summary>
    /// Tên hoặc đường dẫn đến icon của công cụ
    /// </summary>
    public string Icon { get; set; } = null!;

    /// <summary>
    /// Thời gian tạo công cụ
    /// </summary>
    public DateTime CreatedAt { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<FavoriteTool> FavoriteTools { get; set; } = new List<FavoriteTool>();
}
