using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToolsController(ToolService toolService) : ControllerBase
{
    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var id) ? id : null;
    }

    /// <summary>
    /// Gets enabled tools grouped by category for display on home page and sidebar.
    /// </summary>
    [HttpGet] // GET /api/tools
    [ProducesResponseType(typeof(IEnumerable<CategoryWithToolsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CategoryWithToolsDto>>> GetGroupedEnabledTools()
    {
        var userId = GetCurrentUserId(); // Get logged-in user ID
        var groupedTools = await toolService.GetGroupedEnabledToolsAsync(userId);
        return Ok(groupedTools);
    }

    // GET /api/tools/{slug}
    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(ToolDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ToolDetailsDto>> GetToolDetails(string slug)
    {
        var userId = GetCurrentUserId();
        var tool = await toolService.GetToolBySlugAsync(slug, userId);

        return tool == null
            ? (ActionResult<ToolDetailsDto>)NotFound()
            : tool.IsPremium && !User.IsInRole("Premium") && !User.IsInRole("Admin") ? (ActionResult<ToolDetailsDto>)Forbid() : (ActionResult<ToolDetailsDto>)Ok(tool);
    }
}