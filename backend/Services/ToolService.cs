using AutoMapper;
using IT_Tools.Data;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class ToolService(PostgreSQLContext context, IMapper mapper)
{
    /// <summary>
    /// Gets all enabled tools grouped by category, ordered appropriately.
    /// Returns a list of categories, each containing its ordered list of enabled tools.
    /// </summary>
    public async Task<IEnumerable<CategoryWithToolsDto>> GetGroupedEnabledToolsAsync(int? userId)
    {
        var categories = await context.Categories
            .Include(c => c.Tools.Where(t => t.IsEnabled))
            .OrderBy(c => c.Name)
            .AsNoTracking()
            .ToListAsync();

        HashSet<int>? favoriteToolIds = null;
        if (userId.HasValue)
        {
            favoriteToolIds = await context.FavoriteTools
                .Where(ft => ft.UserId == userId.Value)
                .Select(ft => ft.ToolId)
                .ToHashSetAsync();
        }

        var categoryDtos = mapper.Map<List<CategoryWithToolsDto>>(categories);

        foreach (var categoryDto in categoryDtos)
        {
            foreach (var toolDto in categoryDto.Tools)
            {
                toolDto.IsFavorite = favoriteToolIds?.Contains(toolDto.ToolId) ?? false;
            }
            categoryDto.Tools = [.. categoryDto.Tools.OrderBy(t => t.Name)];
        }

        return categoryDtos.Where(c => c.Tools.Any());
    }

    /// <summary>
    /// Gets details for a specific tool by comparing its slugified name.
    /// </summary>
    /// <param name="slug">The URL-friendly slug derived from the tool's name.</param>
    /// <returns>Tool details DTO if found, otherwise null.</returns>
    public async Task<ToolDetailsDto?> GetToolBySlugAsync(string slug, int? userId)
    {
        var toolEntity = await context.Tools
            .AsNoTracking()
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsEnabled);

        if (toolEntity == null) return null;

        var toolDto = mapper.Map<ToolDetailsDto>(toolEntity);

        toolDto.IsFavorite = userId.HasValue && await context.FavoriteTools
                .AnyAsync(ft => ft.UserId == userId.Value && ft.ToolId == toolEntity.ToolId);

        return toolDto;
    }
}