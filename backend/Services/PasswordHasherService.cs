using BCryptNet = BCrypt.Net.BCrypt; // Tạo alias để tránh nhầm lẫn

namespace IT_Tools.Services;

public class PasswordHasherService
{
    public string HashPassword(string password) =>
        BCryptNet.HashPassword(password);

    public bool VerifyPassword(string providedPassword, string passwordHash)
    {
        try
        {
            return BCryptNet.Verify(providedPassword, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
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