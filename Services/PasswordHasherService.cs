using BCryptNet = BCrypt.Net.BCrypt; // Tạo alias để tránh nhầm lẫn

namespace IT_Tools.Services;

public class PasswordHasherService
{
    // Hàm hash mật khẩu
    public string HashPassword(string password) =>
        BCryptNet.HashPassword(password);

    // Hàm kiểm tra mật khẩu có khớp với hash đã lưu không
    public bool VerifyPassword(string providedPassword, string passwordHash)
    {
        try
        {
            return BCryptNet.Verify(providedPassword, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Xử lý trường hợp chuỗi hash không hợp lệ (ví dụ: lỗi dữ liệu)
            Console.WriteLine("Invalid password hash format.");
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error verifying password: {ex.Message}");
            return false;
        }
    }
}