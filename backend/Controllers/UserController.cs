using IT_Tools.Data;
using IT_Tools.Dtos.User;
using IT_Tools.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(PostgreSQLContext context) : ControllerBase
{
    [HttpPost("upgrade-requests")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUpgradeRequest([FromBody] CreateUpgradeRequestDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var requestExists = await context.UpgradeRequests.AnyAsync(c => c.UserId == createDto.UserId && c.Status == "Pending");
        if (requestExists)
        {
            return BadRequest(new { message = "Failed to create request. Request already existed, please wait for administrator decision." });
        }

        var newRequest = new UpgradeRequest
        {
            UserId = createDto.UserId,
        };
        await context.UpgradeRequests.AddAsync(newRequest);
        await context.SaveChangesAsync();

        return Created();
    }
}