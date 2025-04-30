namespace IT_Tools.Models;

/// <summary>
/// Bảng lưu trữ các yêu cầu nâng cấp tài khoản lên Premium
/// </summary>
public partial class UpgradeRequest
{
    /// <summary>
    /// ID định danh duy nhất cho mỗi yêu cầu
    /// </summary>
    public int RequestId { get; set; }

    /// <summary>
    /// Khóa ngoại liên kết đến bảng user
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Trạng thái của yêu cầu (Pending, Approved, Rejected)
    /// </summary>
    public string Status { get; set; } = null!;

    /// <summary>
    /// Thời gian gửi yêu cầu
    /// </summary>
    public DateTime RequestedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
