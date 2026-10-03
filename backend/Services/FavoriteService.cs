using AutoMapper;
using AutoMapper.QueryableExtensions;
using IT_Tools.Data;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Services;

public class FavoriteService(PostgreSQLContext context, IMapper mapper)
{

    /// <summary>
    /// Gets the favorite tools for a specific user.
    /// </summary>
    public async Task<IEnumerable<ToolSummaryDto>> GetUserFavoritesAsync(int userId) => await context.FavoriteTools
            .Where(ft => ft.UserId == userId && ft.Tool != null && ft.Tool.IsEnabled)
            .OrderBy(ft => ft.Tool.Name)
            .Select(ft => ft.Tool)
            .ProjectTo<ToolSummaryDto>(mapper.ConfigurationProvider)
            .ToListAsync();

    /// <summary>
    /// Adds a tool to a user's favorites.
    /// </summary>
    /// <returns>True if added, False if already exists or tool/user not found.</returns>
    public async Task<bool> AddFavoriteAsync(int userId, int toolId)
    {
        var userExists = await context.Users.AnyAsync(u => u.UserId == userId);
        var toolExists = await context.Tools.AnyAsync(t => t.ToolId == toolId && t.IsEnabled);
        if (!userExists || !toolExists) return false;

        var alreadyExists = await context.FavoriteTools
            .AnyAsync(ft => ft.UserId == userId && ft.ToolId == toolId);

        if (alreadyExists)
        {
            return false;
        }

        var favorite = new FavoriteTool { UserId = userId, ToolId = toolId };
        await context.FavoriteTools.AddAsync(favorite);
        await context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Removes a tool from a user's favorites.
    /// </summary>
    /// <returns>True if removed, False if not found.</returns>
    public async Task<bool> RemoveFavoriteAsync(int userId, int toolId)
    {
        var favorite = await context.FavoriteTools
            .FirstOrDefaultAsync(ft => ft.UserId == userId && ft.ToolId == toolId);

        if (favorite == null)
        {
            return false;
        }

        context.FavoriteTools.Remove(favorite);
        await context.SaveChangesAsync();
        return true;
    }
}