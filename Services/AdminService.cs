using AutoMapper;
using AutoMapper.QueryableExtensions;
using IT_Tools.Data;
using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Auth;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using IT_Tools.Utils;
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

    // --- Upgrade Request Management 
    /// <summary>
    /// Gets all pending upgrade requests.
    /// </summary>
    public async Task<IEnumerable<UpgradeRequestDto>> GetPendingUpgradeRequestsAsync() => await context.UpgradeRequests
            .Include(ur => ur.User)
            .Where(ur => ur.Status == "Pending")
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
            .Include(ur => ur.User)
            .FirstOrDefaultAsync(ur => ur.RequestId == requestId);

        if (request == null || request.Status != "Pending")
        {
            return false;
        }

        request.Status = processDto.NewStatus;

        if (processDto.NewStatus == "Approved" && request.User != null)
        {
            request.User.Role = "Premium";
        }

        await context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Gets all tools (including disabled ones) for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync() => await context.Users
            .ProjectTo<AdminUserDto>(mapper.ConfigurationProvider)
            .ToListAsync();


    /// <summary>
    /// Creates a new tool.
    /// </summary>
    public async Task<bool> CreateToolAsync(CreateToolDto createDto)
    {
        var category = await context.Categories
                                .AsNoTracking()
                                .FirstOrDefaultAsync(c => c.Name == createDto.CategoryName);

        if (category == null)
        {
            Console.WriteLine($"Error: Category '{createDto.CategoryName}' not found.");
            return false;
        }

        // Generate Slug from Name
        string generatedSlug = StringUtils.Slugify(createDto.Name);

        var newTool = mapper.Map<Tool>(createDto);
        newTool.Slug = generatedSlug;
        newTool.CategoryId = category.CategoryId;

        await context.Tools.AddAsync(newTool);
        await context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> UpdateToolAsync(int toolId, UpdateToolDto updateDto)
    {
        var tool = await context.Tools.FindAsync(toolId);
        if (tool == null)
        {
            Console.WriteLine($"Error: Tool with ID '{toolId}' not found.");
            return false;
        }

        mapper.Map(updateDto, tool);

        var category = await context.Categories
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(c => c.Name == updateDto.CategoryName);

        if (category != null)
        {
            tool.CategoryId = category.CategoryId;
        }

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteToolAsync(int toolId)
    {
        var tool = await context.Tools.FindAsync(toolId);
        if (tool == null)
        {
            return false;
        }

        context.Tools.Remove(tool);
        await context.SaveChangesAsync();

        return true;
    }
}