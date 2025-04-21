using AutoMapper;
using AutoMapper.QueryableExtensions;
using IT_Tools.Data;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class ToolService(PostgreSQLContext context, IMapper mapper)
{
    public async Task<IEnumerable<ToolSummaryDto>> GetEnabledToolsAsync() =>
        await context.Tools
            .Where(t => t.IsEnabled)
            .Include(t => t.Category)
            .OrderBy(t => t.Category!.Name).ThenBy(t => t.Name)
            .ProjectTo<ToolSummaryDto>(mapper.ConfigurationProvider)
            .ToListAsync();

    public async Task<ToolDetailsDto?> GetToolByIdAsync(int id)
    {
        var tool = await context.Tools
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.ToolId == id);

        return mapper.Map<ToolDetailsDto>(tool);
    }

    public async Task<ToolDetailsDto?> CreateToolAsync(CreateToolDto createDto)
    {
        var categoryExists = await context.Categories.AnyAsync(c => c.Name == createDto.CategoryName);
        if (!categoryExists)
        {
            // Create new category
            var newCategory = new Category
            {
                Name = createDto.CategoryName!
            };
            await context.Categories.AddAsync(newCategory);
        }

        var newTool = mapper.Map<Tool>(createDto);

        await context.Tools.AddAsync(newTool);
        await context.SaveChangesAsync();

        var createdToolEntity = await context.Tools
                                    .Include(t => t.Category)
                                    .FirstOrDefaultAsync(t => t.ToolId == newTool.ToolId);

        return mapper.Map<ToolDetailsDto>(createdToolEntity);
    }
}