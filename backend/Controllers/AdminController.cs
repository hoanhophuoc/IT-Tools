using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Auth;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")] // Route: /api/admin
[Authorize(Roles = "Admin")] // Restrict access to Admin role only
public class AdminController(AdminService adminService) : ControllerBase
{
    /// <summary>
    /// Gets a list of all tools (for admin purposes).
    /// </summary>
    [HttpGet("tools")]
    [ProducesResponseType(typeof(IEnumerable<AdminToolDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AdminToolDto>>> GetAllTools()
    {
        var tools = await adminService.GetAllToolsAsync();
        return Ok(tools);
    }

    /// <summary>
    /// Gets a list of all categories (for admin purposes).
    /// </summary>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(IEnumerable<AdminCategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AdminCategoryDto>>> GetAllCategories()
    {
        var categories = await adminService.GetCategoriesAsync();
        return Ok(categories);
    }

    /// <summary>
    /// Updates the enabled/premium status of a tool.
    /// </summary>
    [HttpPut("tools/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateTool(int id, [FromBody] UpdateToolDto updateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await adminService.UpdateToolAsync(id, updateDto);

        return !success ? NotFound(new { message = $"Tool with ID {id} not found." }) : NoContent();
    }

    /// <summary>
    /// Updates the enabled/premium status of a tool.
    /// </summary>
    [HttpDelete("tools/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTool(int id)
    {
        var success = await adminService.DeleteToolAsync(id);

        return !success ? NotFound(new { message = $"Tool with ID {id} not found." }) : NoContent();
    }

    /// <summary>
    /// Gets a list of pending premium upgrade requests.
    /// </summary>
    [HttpGet("upgrade-requests")]
    [ProducesResponseType(typeof(IEnumerable<UpgradeRequestDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UpgradeRequestDto>>> GetPendingUpgradeRequests()
    {
        var requests = await adminService.GetPendingUpgradeRequestsAsync();
        return Ok(requests);
    }

    /// <summary>
    /// Approves or rejects a pending upgrade request.
    /// </summary>
    [HttpPut("upgrade-requests/{requestId}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessUpgradeRequest(int requestId, [FromBody] ProcessUpgradeRequestDto processDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await adminService.ProcessUpgradeRequestAsync(requestId, processDto);

        return !success ? NotFound(new { message = $"Upgrade request with ID {requestId} not found or already processed." }) : NoContent();
    }

    /// <summary>
    /// Gets a list of users
    /// </summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(IEnumerable<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        var users = await adminService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Creates a new tool
    /// </summary>
    [HttpPost("tools")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTool([FromBody] CreateToolDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var success = await adminService.CreateToolAsync(createDto);

        return !success ?
            BadRequest(new { message = "Failed to create tool. Invalid Category Name or other issue." }) :
            Created();
    }
}