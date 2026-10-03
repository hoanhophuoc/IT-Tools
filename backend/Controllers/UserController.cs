using IT_Tools.Dtos.User;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;

namespace IT_Tools.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(UserService userService) : ControllerBase
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
        var success = await userService.CreateUpgradeRequestAsync(createDto);

        return !success ? BadRequest(new { message = "Failed to create request. Request already existed, please wait for administrator decision." }) : Created();
    }
}