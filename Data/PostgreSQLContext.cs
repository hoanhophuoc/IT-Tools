using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Data;

public partial class PostgreSQLContext : DbContext
{
    public PostgreSQLContext(DbContextOptions<PostgreSQLContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<FavoriteTool> FavoriteTools { get; set; }

    public virtual DbSet<Tool> Tools { get; set; }

    public virtual DbSet<UpgradeRequest> UpgradeRequests { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("category_pkey");

            entity.ToTable("category", tb => tb.HasComment("Bảng lưu trữ các danh mục công cụ"));

            entity.HasIndex(e => e.Name, "category_name_key").IsUnique();

            entity.Property(e => e.CategoryId)
                .HasComment("ID định danh duy nhất cho mỗi danh mục")
                .HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .HasComment("Tên của danh mục, phải là duy nhất")
                .HasColumnName("name");
        });

        modelBuilder.Entity<FavoriteTool>(entity =>
        {
            entity.HasKey(e => e.FavoriteId).HasName("favorite_tool_pkey");

            entity.ToTable("favorite_tool", tb => tb.HasComment("Bảng lưu trữ các công cụ yêu thích của người dùng"));

            entity.HasIndex(e => e.UserId, "idx_userfavoritetools_user");

            entity.Property(e => e.FavoriteId)
                .HasComment("ID định danh duy nhất cho mỗi mục yêu thích")
                .HasColumnName("favorite_id");
            entity.Property(e => e.ToolId)
                .HasComment("Khóa ngoại liên kết đến bảng tool")
                .HasColumnName("tool_id");
            entity.Property(e => e.UserId)
                .HasComment("Khóa ngoại liên kết đến bảng user")
                .HasColumnName("user_id");

            entity.HasOne(d => d.Tool).WithMany(p => p.FavoriteTools)
                .HasForeignKey(d => d.ToolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("favorite_tool_tool_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.FavoriteTools)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("favorite_tool_user_id_fkey");
        });

        modelBuilder.Entity<Tool>(entity =>
        {
            entity.HasKey(e => e.ToolId).HasName("tool_pkey");

            entity.ToTable("tool", tb => tb.HasComment("Bảng lưu trữ thông tin về các công cụ IT"));

            entity.HasIndex(e => e.IsEnabled, "idx_tools_is_enabled");

            entity.HasIndex(e => e.ComponentUrl, "tool_component_url_key").IsUnique();

            entity.HasIndex(e => e.Name, "tool_name_key").IsUnique();

            entity.Property(e => e.ToolId)
                .HasComment("ID định danh duy nhất cho mỗi công cụ")
                .HasColumnName("tool_id");
            entity.Property(e => e.CategoryId)
                .HasComment("Khóa ngoại liên kết đến bảng category")
                .HasColumnName("category_id");
            entity.Property(e => e.ComponentUrl)
                .HasMaxLength(100)
                .HasComment("Tên component ReactJS tương ứng với công cụ, phải là duy nhất")
                .HasColumnName("component_url");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasComment("Thời gian tạo công cụ")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasComment("Mô tả chi tiết về công cụ")
                .HasColumnName("description");
            entity.Property(e => e.Icon)
                .HasMaxLength(100)
                .HasComment("Tên hoặc đường dẫn đến icon của công cụ")
                .HasColumnName("icon");
            entity.Property(e => e.IsEnabled)
                .HasDefaultValue(true)
                .HasComment("Trạng thái kích hoạt của công cụ (true: hoạt động, false: không hoạt động)")
                .HasColumnName("is_enabled");
            entity.Property(e => e.IsPremium)
                .HasDefaultValue(false)
                .HasComment("Đánh dấu công cụ có phải là premium hay không (true: premium, false: miễn phí)")
                .HasColumnName("is_premium");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasComment("Tên của công cụ, phải là duy nhất")
                .HasColumnName("name");

            entity.HasOne(d => d.Category).WithMany(p => p.Tools)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("tool_category_id_fkey");
        });

        modelBuilder.Entity<UpgradeRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("upgrade_request_pkey");

            entity.ToTable("upgrade_request", tb => tb.HasComment("Bảng lưu trữ các yêu cầu nâng cấp tài khoản lên Premium"));

            entity.Property(e => e.RequestId)
                .HasComment("ID định danh duy nhất cho mỗi yêu cầu")
                .HasColumnName("request_id");
            entity.Property(e => e.RequestedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasComment("Thời gian gửi yêu cầu")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("requested_at");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasComment("Trạng thái của yêu cầu (Pending, Approved, Rejected)")
                .HasColumnName("status");
            entity.Property(e => e.UserId)
                .HasComment("Khóa ngoại liên kết đến bảng user")
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UpgradeRequests)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("upgrade_request_user_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("user_pkey");

            entity.ToTable("user", tb => tb.HasComment("Bảng lưu trữ thông tin người dùng"));

            entity.HasIndex(e => e.Role, "idx_users_role");

            entity.HasIndex(e => e.Username, "user_username_key").IsUnique();

            entity.Property(e => e.UserId)
                .HasComment("ID định danh duy nhất cho mỗi người dùng")
                .HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasComment("Thời gian tạo tài khoản người dùng")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasComment("Mật khẩu đã được mã hóa của người dùng")
                .HasColumnName("password");
            entity.Property(e => e.Role)
                .HasMaxLength(10)
                .HasDefaultValueSql("'User'::character varying")
                .HasComment("Vai trò của người dùng (User, Premium, Admin)")
                .HasColumnName("role");
            entity.Property(e => e.Username)
                .HasMaxLength(255)
                .HasComment("Tên đăng nhập của người dùng, phải là duy nhất")
                .HasColumnName("username");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
