using System;
using System.Collections.Generic;

namespace IT_Tools.Models;

/// <summary>
/// Bảng lưu trữ các danh mục công cụ
/// </summary>
public partial class Category
{
    /// <summary>
    /// ID định danh duy nhất cho mỗi danh mục
    /// </summary>
    public int CategoryId { get; set; }

    /// <summary>
    /// Tên của danh mục, phải là duy nhất
    /// </summary>
    public string Name { get; set; } = null!;

    public virtual ICollection<Tool> Tools { get; set; } = new List<Tool>();
}
