using AutoMapper;
using AutoMapper.QueryableExtensions;
using IT_Tools.Data;
using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Auth;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class AdminService(PostgreSQLContext context, IMapper mapper)
{
    /// <summary>
    /// Gets all tools (including disabled ones) for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminToolDto>> GetAllToolsAsync() => await context.Tools
            .Include(t => t.Category)
            .OrderBy(t => t.Name)
            .ProjectTo<AdminToolDto>(mapper.ConfigurationProvider) // Use ProjectTo for efficiency
            .ToListAsync();

    /// <summary>
    /// Gets all categories for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminCategoryDto>> GetCategoriesAsync() =>
        await context.Categories
            .OrderBy(t => t.Name)
            .ProjectTo<AdminCategoryDto>(mapper.ConfigurationProvider)
            .ToListAsync();

    /// <summary>
    /// Updates the enabled and premium status of a specific tool.
    /// </summary>
    /// <returns>True if successful, False if tool not found.</returns>
    public async Task<bool> UpdateToolStatusAsync(int toolId, UpdateToolStatusDto updateDto)
    {
        var tool = await context.Tools.FindAsync(toolId);
        if (tool == null)
        {
            return false; // Tool not found
        }

        tool.IsEnabled = updateDto.IsEnabled;
        tool.IsPremium = updateDto.IsPremium;

        await context.SaveChangesAsync();
        return true;
    }

    // --- Upgrade Request Management 
    /// <summary>
    /// Gets all pending upgrade requests.
    /// </summary>
    public async Task<IEnumerable<UpgradeRequestDto>> GetPendingUpgradeRequestsAsync() => await context.UpgradeRequests
            .Include(ur => ur.User) // Include User to get username
            .Where(ur => ur.Status == "Pending") // Make sure "Pending" matches your default status
            .OrderBy(ur => ur.RequestedAt)
            .ProjectTo<UpgradeRequestDto>(mapper.ConfigurationProvider)
            .ToListAsync();

    /// <summary>
    /// Processes an upgrade request (Approve or Reject).
    /// </summary>
    /// <param name="requestId">ID of the request.</param>
    /// <param name="processDto">Contains the new status ('Approved' or 'Rejected').</param>
    /// <returns>True if successful, False if request not found or already processed.</returns>
    public async Task<bool> ProcessUpgradeRequestAsync(int requestId, ProcessUpgradeRequestDto processDto)
    {
        var request = await context.UpgradeRequests
            .Include(ur => ur.User) // Need user to update role
            .FirstOrDefaultAsync(ur => ur.RequestId == requestId);

        // Validate request exists and is pending
        if (request == null || request.Status != "Pending")
        {
            return false; // Request not found or already processed
        }

        // Update request status
        request.Status = processDto.NewStatus;

        // If approved, update user role
        if (processDto.NewStatus == "Approved" && request.User != null)
        {
            request.User.Role = "Premium"; // Update user role
        }

        await context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Gets all tools (including disabled ones) for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync() => await context.Users
            .ProjectTo<AdminUserDto>(mapper.ConfigurationProvider) // Use ProjectTo for efficiency
            .ToListAsync();
}