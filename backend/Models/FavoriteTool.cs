namespace IT_Tools.Models;

/// <summary>
/// Bảng lưu trữ các công cụ yêu thích của người dùng
/// </summary>
public partial class FavoriteTool
{
    /// <summary>
    /// ID định danh duy nhất cho mỗi mục yêu thích
    /// </summary>
    public int FavoriteId { get; set; }

    /// <summary>
    /// Khóa ngoại liên kết đến bảng user
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Khóa ngoại liên kết đến bảng tool
    /// </summary>
    public int ToolId { get; set; }

    public virtual Tool Tool { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
