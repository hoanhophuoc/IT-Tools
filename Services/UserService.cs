using IT_Tools.Data;
using IT_Tools.Dtos.User;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class UserService(PostgreSQLContext context)
{
    /// <summary>
    /// Create upgrade request for a specific user.
    /// </summary>
    public async Task<bool> CreateUpgradeRequestAsync(CreateUpgradeRequestDto createDto)
    {
        var requestExists = await context.UpgradeRequests.AnyAsync(c => c.UserId == createDto.UserId && c.Status == "Pending");
        if (requestExists)
        {
            return false;
        }

        var newRequest = new UpgradeRequest
        {
            UserId = createDto.UserId,
        };
        await context.UpgradeRequests.AddAsync(newRequest);
        await context.SaveChangesAsync();
        return true;
    }
}