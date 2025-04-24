using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToolsController(ToolService toolService) : ControllerBase
{
    /// <summary>
    /// Gets enabled tools grouped by category for display on home page and sidebar.
    /// </summary>
    [HttpGet] // Matches GET /api/tools
    [ProducesResponseType(typeof(IEnumerable<CategoryWithToolsDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CategoryWithToolsDto>>> GetGroupedEnabledTools()
    {
        var groupedTools = await toolService.GetGroupedEnabledToolsAsync();
        return Ok(groupedTools);
    }

    // GET /api/tools/{slug} <-- Route param reflects usage
    [HttpGet("{slug}")] // Route uses slug
    [ProducesResponseType(typeof(ToolDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ToolDetailsDto>> GetToolDetails(string slug) // Param is slug
    {
        // Call the service method that uses the stored slug
        var tool = await toolService.GetToolBySlugAsync(slug); // Call correct method

        if (tool == null)
        {
            return NotFound();
        }

        // Kiểm tra quyền truy cập tool premium
        if (tool.IsPremium && !User.IsInRole("Premium") && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        // Permission check etc.
        return Ok(tool);
    }

    // Tạo tool mới
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IActionResult>> CreateTool([FromBody] CreateToolDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var success = await toolService.CreateToolAsync(createDto);

        return !success ? BadRequest(new { message = "Failed to create tool." }) : Created();
    }
}