using AutoMapper;
using IT_Tools.Data;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using IT_Tools.Utils;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class ToolService(PostgreSQLContext context, IMapper mapper)
{
    /// <summary>
    /// Gets all enabled tools grouped by category, ordered appropriately.
    /// Returns a list of categories, each containing its ordered list of enabled tools.
    /// </summary>
    public async Task<IEnumerable<CategoryWithToolsDto>> GetGroupedEnabledToolsAsync()
    {
        var categoriesWithTools = await context.Categories
            .Include(c => c.Tools.Where(t => t.IsEnabled)) // Include only enabled tools for each category
            .OrderBy(c => c.Name) // Order categories by name
            .ToListAsync(); // Fetch the data

        // Now map the fetched entities to the DTO structure using AutoMapper
        // The mapping profile defined earlier handles the tool filtering and ordering within each category
        var resultDto = mapper.Map<IEnumerable<CategoryWithToolsDto>>(categoriesWithTools);

        // Filter out categories that might have become empty after filtering enabled tools
        // (though the .Include().Where() should ideally handle this)
        return resultDto.Where(c => c.Tools.Any());
    }

    /// <summary>
    /// Gets details for a specific tool by comparing its slugified name.
    /// </summary>
    /// <param name="slug">The URL-friendly slug derived from the tool's name.</param>
    /// <returns>Tool details DTO if found, otherwise null.</returns>
    public async Task<ToolDetailsDto?> GetToolBySlugAsync(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        // *** Query directly using the slug column ***
        var foundTool = await context.Tools
            .AsNoTracking() // Read-only query
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Slug == slug && t.IsEnabled); // Find by slug and ensure enabled

        return mapper.Map<ToolDetailsDto?>(foundTool); // Map (handles null)
    }

    public async Task<bool> CreateToolAsync(CreateToolDto createDto)
    {
        var categoryExists = await context.Categories.AnyAsync(c => c.Name == createDto.CategoryName);
        if (!categoryExists)
        {
            await context.Categories.AddAsync(new Category { Name = createDto.CategoryName! });
        }

        // *** Generate Slug from Name ***
        string generatedSlug = StringUtils.Slugify(createDto.Name);

        var newTool = mapper.Map<Tool>(createDto);
        newTool.Slug = generatedSlug;

        await context.Tools.AddAsync(newTool);
        await context.SaveChangesAsync();

        return true;
    }
}