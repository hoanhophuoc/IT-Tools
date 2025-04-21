namespace IT_Tools.Models;

/// <summary>
/// Bảng lưu trữ thông tin người dùng
/// </summary>
public partial class User
{
    /// <summary>
    /// ID định danh duy nhất cho mỗi người dùng
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Tên đăng nhập của người dùng, phải là duy nhất
    /// </summary>
    public string Username { get; set; } = null!;

    /// <summary>
    /// Mật khẩu đã được mã hóa của người dùng
    /// </summary>
    public string Password { get; set; } = null!;

    /// <summary>
    /// Vai trò của người dùng (User, Premium, Admin)
    /// </summary>
    public string Role { get; set; } = null!;

    /// <summary>
    /// Thời gian tạo tài khoản người dùng
    /// </summary>
    public DateTime CreatedAt { get; set; }

    public virtual ICollection<FavoriteTool> FavoriteTools { get; set; } = new List<FavoriteTool>();

    public virtual ICollection<UpgradeRequest> UpgradeRequests { get; set; } = new List<UpgradeRequest>();
}
