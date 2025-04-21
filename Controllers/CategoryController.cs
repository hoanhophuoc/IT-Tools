using IT_Tools.Dtos.Tools;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController(ToolService toolService) : ControllerBase
{
    // Trả về danh sách DTO
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ToolSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ToolSummaryDto>>> GetEnabledTools()
    {
        var tools = await toolService.GetEnabledToolsAsync();
        return Ok(tools); // Trả về danh sách DTO
    }

    // Trả về DTO chi tiết
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ToolDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ToolDetailsDto>> GetToolDetails(int id)
    {
        var tool = await toolService.GetToolByIdAsync(id);
        if (tool == null)
        {
            return NotFound();
        }

        // Kiểm tra quyền truy cập tool premium
        if (tool.IsPremium && !User.IsInRole("Premium") && !User.IsInRole("Admin"))
        {
            return Forbid();
        }

        return Ok(tool); // Trả về DTO chi tiết
    }

    // Tạo tool mới
    [HttpPost]
    [ProducesResponseType(typeof(ToolDetailsDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ToolDetailsDto>> CreateTool([FromBody] CreateToolDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        var createdTool = await toolService.CreateToolAsync(createDto);

        return CreatedAtAction(nameof(GetToolDetails), new { id = createdTool!.ToolId }, createdTool);
    }
}