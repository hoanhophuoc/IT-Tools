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
[Authorize(Roles = "Admin")] // Restrict access to Admin role ONLY
public class AdminController(AdminService adminService) : ControllerBase
{
    // --- Tool Endpoints ---
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
    [HttpPut("tools/{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateToolStatus(int id, [FromBody] UpdateToolStatusDto updateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var success = await adminService.UpdateToolStatusAsync(id, updateDto);

        if (!success)
        {
            return NotFound(new { message = $"Tool with ID {id} not found." });
        }

        return NoContent(); // Success
    }

    // --- Upgrade Request Endpoints ---
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

        if (!success)
        {
            return NotFound(new { message = $"Upgrade request with ID {requestId} not found or already processed." });
        }

        return NoContent(); // Success
    }

    // --- User Management Endpoints ---
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

        //if (newTool == null)
        //{
        //    // Service trả về null (ví dụ: category không hợp lệ)
        //    // Trả về BadRequestObjectResult (là một ActionResult) -> HỢP LỆ với ActionResult<T>
        //    return BadRequest(new { message = "Failed to create tool. Invalid Category Name or other issue." });
        //}

        //return CreatedAtAction(
        //     nameof(ToolsController.GetToolDetails),
        //     "Tools", // Controller name
        //     new { slugIdentifier = newTool.Slug }, // Route values
        //     newTool); // <-- Value trả về (kiểu ToolDetailsDto)
        return !success ?
            BadRequest(new { message = "Failed to create tool. Invalid Category Name or other issue." }) :
            Created();
    }
}