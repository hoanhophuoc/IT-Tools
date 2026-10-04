using IT_Tools.Data;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController(PostgreSQLContext context) : ControllerBase
{
    // Helper to get current required user ID (throws if not found)
    private int GetRequiredCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var id))
        {
            // This shouldn't happen if [Authorize] is working
            throw new InvalidOperationException("User ID not found in token.");
        }
        return id;
    }

    // GET /api/favorites
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ToolSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ToolSummaryDto>>> GetMyFavorites()
    {
        var userId = GetRequiredCurrentUserId();
        var favorites = await context.FavoriteTools
            .Where(ft => ft.UserId == userId && ft.Tool != null && ft.Tool.IsEnabled)
            .OrderBy(ft => ft.Tool!.Name)
            .Select(ft => new ToolSummaryDto
            {
                ToolId = ft.Tool!.ToolId,
                Name = ft.Tool.Name,
                Description = ft.Tool.Description,
                Slug = ft.Tool.Slug,
                Icon = ft.Tool.Icon,
                IsPremium = ft.Tool.IsPremium,
                IsFavorite = true,
            })
            .ToListAsync();
        return Ok(favorites);
    }

    // POST /api/favorites/{toolId}
    [HttpPost("{toolId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddFavorite(int toolId)
    {
        var userId = GetRequiredCurrentUserId();
        var userExists = await context.Users.AnyAsync(u => u.UserId == userId);
        var toolExists = await context.Tools.AnyAsync(t => t.ToolId == toolId && t.IsEnabled);
        if (!userExists || !toolExists)
        {
            return BadRequest(new { message = "Tool not found, not enabled, or already favorited." });
        }

        var alreadyExists = await context.FavoriteTools
            .AnyAsync(ft => ft.UserId == userId && ft.ToolId == toolId);
        if (alreadyExists)
        {
            return BadRequest(new { message = "Tool not found, not enabled, or already favorited." });
        }

        var favorite = new FavoriteTool { UserId = userId, ToolId = toolId };
        await context.FavoriteTools.AddAsync(favorite);
        await context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/favorites/{toolId}
    [HttpDelete("{toolId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFavorite(int toolId)
    {
        var userId = GetRequiredCurrentUserId();
        var favorite = await context.FavoriteTools
            .FirstOrDefaultAsync(ft => ft.UserId == userId && ft.ToolId == toolId);
        if (favorite == null)
        {
            return NotFound(new { message = "Favorite not found." });
        }

        context.FavoriteTools.Remove(favorite);
        await context.SaveChangesAsync();
        return NoContent();
    }
}