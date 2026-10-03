using IT_Tools.Dtos.Tools;
using IT_Tools.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController(FavoriteService favoriteService) : ControllerBase
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
        var favorites = await favoriteService.GetUserFavoritesAsync(userId);
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
        var success = await favoriteService.AddFavoriteAsync(userId, toolId);
        return !success ? BadRequest(new { message = "Tool not found, not enabled, or already favorited." }) : NoContent();
    }

    // DELETE /api/favorites/{toolId}
    [HttpDelete("{toolId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveFavorite(int toolId)
    {
        var userId = GetRequiredCurrentUserId();
        var success = await favoriteService.RemoveFavoriteAsync(userId, toolId);
        return !success ? NotFound(new { message = "Favorite not found." }) : NoContent();
    }
}