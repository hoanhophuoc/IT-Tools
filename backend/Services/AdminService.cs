using IT_Tools.Data;
using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Auth;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public partial class AdminService(PostgreSQLContext context)
{
    /// <summary>
    /// Gets all tools (including disabled ones) for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminToolDto>> GetAllToolsAsync() => await context.Tools
            .OrderBy(t => t.Name)
            .Select(t => new AdminToolDto
            {
                ToolId = t.ToolId,
                Name = t.Name,
                Description = t.Description,
                Slug = t.Slug,
                Icon = t.Icon,
                IsPremium = t.IsPremium,
                CategoryId = t.CategoryId,
                CategoryName = t.Category != null ? t.Category.Name : string.Empty,
                ComponentUrl = t.ComponentUrl,
                IsEnabled = t.IsEnabled,
                CreatedAt = t.CreatedAt,
            })
            .ToListAsync();

    /// <summary>
    /// Gets all categories for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminCategoryDto>> GetCategoriesAsync() =>
        await context.Categories
            .OrderBy(t => t.Name)
            .Select(c => new AdminCategoryDto
            {
                CategoryId = c.CategoryId,
                Name = c.Name,
            })
            .ToListAsync();

    // --- Upgrade Request Management 
    /// <summary>
    /// Gets all pending upgrade requests.
    /// </summary>
    public async Task<IEnumerable<UpgradeRequestDto>> GetPendingUpgradeRequestsAsync() => await context.UpgradeRequests
            .Where(ur => ur.Status == "Pending")
            .OrderBy(ur => ur.RequestedAt)
            .Select(ur => new UpgradeRequestDto
            {
                RequestId = ur.RequestId,
                UserId = ur.UserId,
                Username = ur.User != null ? ur.User.Username : "N/A",
                Status = ur.Status,
                RequestedAt = ur.RequestedAt,
            })
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
    /// Gets all users for admin view.
    /// </summary>
    public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync() => await context.Users
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                Username = u.Username,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
            })
            .ToListAsync();

    /// <summary>
    /// Creates a new tool.
    /// </summary>
    public async Task<bool> CreateToolAsync(CreateToolDto createDto)
    {
        var trimmedCatName = createDto.CategoryName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmedCatName))
        {
            return false;
        }

        var category = await context.Categories
                                .FirstOrDefaultAsync(c => EF.Functions.ILike(c.Name, trimmedCatName));

        if (category == null)
        {
            category = new Category { Name = trimmedCatName };
            await context.Categories.AddAsync(category);
            await context.SaveChangesAsync();
        }

        // Generate Slug from Name
        string generatedSlug = Slugify(createDto.Name);

        string toolName = createDto.Name;
        if (await context.Tools.AnyAsync(t => t.Slug == generatedSlug || EF.Functions.ILike(t.Name, toolName)))
        {
            return false;
        }

        var newTool = new Tool
        {
            Name = createDto.Name,
            Description = createDto.Description ?? string.Empty,
            Icon = createDto.Icon ?? string.Empty,
            ComponentUrl = createDto.ComponentUrl,
            IsEnabled = createDto.IsEnabled,
            IsPremium = createDto.IsPremium,
            Slug = generatedSlug,
            CategoryId = category.CategoryId,
            CreatedAt = DateTime.UtcNow,
        };

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

        tool.Name = updateDto.Name;
        tool.Description = updateDto.Description ?? tool.Description;
        tool.Icon = updateDto.Icon ?? tool.Icon;
        tool.ComponentUrl = updateDto.ComponentUrl;
        tool.IsEnabled = updateDto.IsEnabled;
        tool.IsPremium = updateDto.IsPremium;

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

    [System.Text.RegularExpressions.GeneratedRegex(@"\s+", System.Text.RegularExpressions.RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial System.Text.RegularExpressions.Regex WhitespaceRegex();

    [System.Text.RegularExpressions.GeneratedRegex(@"[^a-z0-9\-]", System.Text.RegularExpressions.RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial System.Text.RegularExpressions.Regex NonSlugCharRegex();

    [System.Text.RegularExpressions.GeneratedRegex(@"-{2,}", System.Text.RegularExpressions.RegexOptions.None, matchTimeoutMilliseconds: 1000)]
    private static partial System.Text.RegularExpressions.Regex ConsecutiveDashesRegex();

    private static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        string normalized = text.ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD);
        var sb = new System.Text.StringBuilder(normalized.Length);
        foreach (char c in normalized)
        {
            if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }
        string decomposed = sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
        string slug = WhitespaceRegex().Replace(decomposed, "-");
        slug = NonSlugCharRegex().Replace(slug, "");
        slug = ConsecutiveDashesRegex().Replace(slug, "-");
        return slug.Trim('-');
    }
}