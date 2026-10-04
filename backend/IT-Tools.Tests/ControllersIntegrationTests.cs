using IT_Tools.Controllers;
using IT_Tools.Data;
using IT_Tools.Dtos.User;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace IT_Tools.Tests;

public class ControllersIntegrationTests
{
    private static PostgreSQLContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PostgreSQLContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PostgreSQLContext(options);
    }

    private static ControllerContext CreateUserContext(int userId, string role = "User")
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    [Fact]
    public async Task UserController_CreateUpgradeRequest_ReturnsCreated_WhenNoPendingRequest()
    {
        using var context = CreateContext(nameof(UserController_CreateUpgradeRequest_ReturnsCreated_WhenNoPendingRequest));
        var user = new User { UserId = 1, Username = "testuser", Password = "hash", Role = "User" };
        context.Users.Add(user);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var controller = new UserController(context);
        var dto = new CreateUpgradeRequestDto { UserId = 1 };

        var result = await controller.CreateUpgradeRequest(dto);

        Assert.IsType<CreatedResult>(result);
        var created = await context.UpgradeRequests.FirstOrDefaultAsync(u => u.UserId == 1, TestContext.Current.CancellationToken);
        Assert.NotNull(created);
        Assert.Equal("Pending", created.Status);
    }

    [Fact]
    public async Task UserController_CreateUpgradeRequest_ReturnsBadRequest_WhenPendingAlreadyExists()
    {
        using var context = CreateContext(nameof(UserController_CreateUpgradeRequest_ReturnsBadRequest_WhenPendingAlreadyExists));
        context.UpgradeRequests.Add(new UpgradeRequest { UserId = 2, Status = "Pending" });
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var controller = new UserController(context);
        var dto = new CreateUpgradeRequestDto { UserId = 2 };

        var result = await controller.CreateUpgradeRequest(dto);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task FavoritesController_ReturnsOkAndHandlesAddRemove()
    {
        using var context = CreateContext(nameof(FavoritesController_ReturnsOkAndHandlesAddRemove));
        var user = new User { UserId = 5, Username = "favuser", Password = "hash", Role = "User" };
        var category = new Category { CategoryId = 1, Name = "Dev" };
        var tool = new Tool
        {
            ToolId = 10,
            Name = "JSON Formatter",
            Slug = "json-fmt",
            Description = "Format JSON",
            Icon = "json.svg",
            ComponentUrl = "/tools/json",
            CategoryId = 1,
            IsEnabled = true
        };
        context.Users.Add(user);
        context.Categories.Add(category);
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var favoriteService = new FavoriteService(context);
        var controller = new FavoritesController(favoriteService)
        {
            ControllerContext = CreateUserContext(userId: 5)
        };

        // 1. Get initial favorites -> empty
        var getInitial = await controller.GetMyFavorites();
        var okResult = Assert.IsType<OkObjectResult>(getInitial.Result);
        Assert.NotNull(okResult.Value);

        // 2. Add favorite -> 204 NoContent
        var addResult = await controller.AddFavorite(10);
        Assert.IsType<NoContentResult>(addResult);

        // 3. Add duplicate -> 400 BadRequest
        var duplicateAdd = await controller.AddFavorite(10);
        Assert.IsType<BadRequestObjectResult>(duplicateAdd);

        // 4. Remove favorite -> 204 NoContent
        var removeResult = await controller.RemoveFavorite(10);
        Assert.IsType<NoContentResult>(removeResult);

        // 5. Remove again -> 404 NotFound
        var removeAgain = await controller.RemoveFavorite(10);
        Assert.IsType<NotFoundObjectResult>(removeAgain);
    }

    [Fact]
    public async Task ToolsController_EnforcesPremiumRoleSecurity()
    {
        using var context = CreateContext(nameof(ToolsController_EnforcesPremiumRoleSecurity));
        var category = new Category { CategoryId = 1, Name = "Security" };
        var freeTool = new Tool
        {
            ToolId = 1,
            Name = "Hash",
            Slug = "hash",
            Description = "Hash Text",
            Icon = "hash.svg",
            ComponentUrl = "/tools/hash",
            CategoryId = 1,
            IsEnabled = true,
            IsPremium = false
        };
        var premiumTool = new Tool
        {
            ToolId = 2,
            Name = "VIP Tool",
            Slug = "vip-tool",
            Description = "VIP Only",
            Icon = "vip.svg",
            ComponentUrl = "/tools/vip",
            CategoryId = 1,
            IsEnabled = true,
            IsPremium = true
        };
        context.Categories.Add(category);
        context.Tools.AddRange(freeTool, premiumTool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var toolService = new ToolService(context);

        // User without Premium role
        var normalController = new ToolsController(toolService)
        {
            ControllerContext = CreateUserContext(userId: 10, role: "User")
        };

        // Free tool is accessible
        var freeResult = await normalController.GetToolDetails("hash");
        Assert.IsType<OkObjectResult>(freeResult.Result);

        // Premium tool is Forbidden
        var forbiddenResult = await normalController.GetToolDetails("vip-tool");
        Assert.IsType<ForbidResult>(forbiddenResult.Result);

        // User WITH Premium role
        var premiumController = new ToolsController(toolService)
        {
            ControllerContext = CreateUserContext(userId: 20, role: "Premium")
        };

        var allowedResult = await premiumController.GetToolDetails("vip-tool");
        Assert.IsType<OkObjectResult>(allowedResult.Result);

        // Non-existent slug returns NotFound
        var notFoundResult = await premiumController.GetToolDetails("does-not-exist");
        Assert.IsType<NotFoundResult>(notFoundResult.Result);

        // Admin role also allows access to premium tool
        var adminController = new ToolsController(toolService)
        {
            ControllerContext = CreateUserContext(userId: 99, role: "Admin")
        };
        var adminResult = await adminController.GetToolDetails("vip-tool");
        Assert.IsType<OkObjectResult>(adminResult.Result);
    }

    [Fact]
    public async Task ToolsController_GetGroupedEnabledTools_ReturnsOk_ForAnonymousUser()
    {
        using var context = CreateContext(nameof(ToolsController_GetGroupedEnabledTools_ReturnsOk_ForAnonymousUser));
        var category = new Category { CategoryId = 1, Name = "Converters" };
        var tool = new Tool
        {
            ToolId = 1,
            Name = "Base64",
            Slug = "base64",
            Description = "Base64 encode",
            Icon = "b64.svg",
            ComponentUrl = "/tools/base64",
            CategoryId = 1,
            IsEnabled = true,
            IsPremium = false
        };
        context.Categories.Add(category);
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var toolService = new ToolService(context);
        var controller = new ToolsController(toolService)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        var result = await controller.GetGroupedEnabledTools();
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task FavoritesController_Throws_WhenUserIdClaimMissing()
    {
        using var context = CreateContext(nameof(FavoritesController_Throws_WhenUserIdClaimMissing));
        var favoriteService = new FavoriteService(context);
        var controller = new FavoritesController(favoriteService)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => controller.GetMyFavorites());
    }
}
