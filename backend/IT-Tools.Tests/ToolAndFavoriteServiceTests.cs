using IT_Tools.Controllers;
using IT_Tools.Data;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace IT_Tools.Tests;

public class ToolAndFavoriteServiceTests
{
    private static PostgreSQLContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PostgreSQLContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PostgreSQLContext(options);
    }

    private static ControllerContext CreateUserContext(int userId)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

    [Fact]
    public async Task ToolService_GetGroupedEnabledToolsAsync_ReturnsOnlyEnabledToolsGrouped()
    {
        using var context = CreateInMemoryContext(nameof(ToolService_GetGroupedEnabledToolsAsync_ReturnsOnlyEnabledToolsGrouped));
        
        var cat1 = new Category { CategoryId = 1, Name = "Converters" };
        var cat2 = new Category { CategoryId = 2, Name = "EmptyCategory" };
        context.Categories.AddRange(cat1, cat2);

        var toolEnabled = new Tool
        {
            ToolId = 10,
            CategoryId = 1,
            Name = "Base64 Converter",
            Slug = "base64-converter",
            Description = "Encode Base64",
            Icon = "base64.svg",
            ComponentUrl = "/tools/base64-converter",
            IsEnabled = true
        };
        var toolDisabled = new Tool
        {
            ToolId = 11,
            CategoryId = 1,
            Name = "Secret Disabled Tool",
            Slug = "disabled-tool",
            Description = "Disabled",
            Icon = "disabled.svg",
            ComponentUrl = "/tools/disabled",
            IsEnabled = false
        };
        context.Tools.AddRange(toolEnabled, toolDisabled);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var toolService = new ToolService(context);
        var categories = (await toolService.GetGroupedEnabledToolsAsync(null)).ToList();

        var singleCat = Assert.Single(categories); // Only cat1 has enabled tools, cat2 empty excluded
        Assert.Equal("Converters", singleCat.Name);
        var singleTool = Assert.Single(singleCat.Tools);
        Assert.Equal("Base64 Converter", singleTool.Name);
    }

    [Fact]
    public async Task ToolService_GetToolBySlugAsync_ReturnsCorrectToolOrNull()
    {
        using var context = CreateInMemoryContext(nameof(ToolService_GetToolBySlugAsync_ReturnsCorrectToolOrNull));
        
        var tool = new Tool
        {
            ToolId = 20,
            CategoryId = 1,
            Name = "Color Converter",
            Slug = "color-converter",
            IsEnabled = true,
            Description = "Converts hex to rgb",
            Icon = "color.svg",
            ComponentUrl = "/tools/color-converter"
        };
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var toolService = new ToolService(context);

        var found = await toolService.GetToolBySlugAsync("color-converter", null);
        Assert.NotNull(found);
        Assert.Equal("Color Converter", found.Name);

        var notFound = await toolService.GetToolBySlugAsync("non-existent-tool", null);
        Assert.Null(notFound);
    }

    [Fact]
    public async Task FavoritesController_AddAndRemoveFavorite_ManagesFavoritesCorrectly()
    {
        using var context = CreateInMemoryContext(nameof(FavoritesController_AddAndRemoveFavorite_ManagesFavoritesCorrectly));

        var user = new User { UserId = 1, Username = "favUser", Password = "pwd", Role = "User" };
        var tool = new Tool { ToolId = 50, CategoryId = 1, Name = "FavTool", Slug = "fav-tool", Description = "Fav", Icon = "fav.svg", ComponentUrl = "/fav", IsEnabled = true };
        context.Users.Add(user);
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var controller = new FavoritesController(context)
        {
            ControllerContext = CreateUserContext(1)
        };

        // Add Favorite
        var addResult = await controller.AddFavorite(50);
        Assert.IsType<NoContentResult>(addResult);

        // Verify it exists
        var getResult = await controller.GetMyFavorites();
        var okResult = Assert.IsType<OkObjectResult>(getResult.Result);
        var favorites = Assert.IsType<IEnumerable<ToolSummaryDto>>(okResult.Value, exactMatch: false).ToList();
        var singleFav = Assert.Single(favorites);
        Assert.Equal("FavTool", singleFav.Name);

        // Adding duplicate favorite returns BadRequest
        var addDup = await controller.AddFavorite(50);
        Assert.IsType<BadRequestObjectResult>(addDup);

        // Remove Favorite
        var removeResult = await controller.RemoveFavorite(50);
        Assert.IsType<NoContentResult>(removeResult);

        var getAfterRemove = await controller.GetMyFavorites();
        var okAfterRemove = Assert.IsType<OkObjectResult>(getAfterRemove.Result);
        var favoritesAfterRemove = Assert.IsType<IEnumerable<ToolSummaryDto>>(okAfterRemove.Value, exactMatch: false).ToList();
        Assert.Empty(favoritesAfterRemove);

        // Remove non-existent favorite returns NotFound
        var removeNotFound = await controller.RemoveFavorite(999);
        Assert.IsType<NotFoundObjectResult>(removeNotFound);
    }

    [Fact]
    public async Task FavoritesController_AddFavorite_ReturnsBadRequest_WhenUserOrToolMissingOrDisabled()
    {
        using var context = CreateInMemoryContext(nameof(FavoritesController_AddFavorite_ReturnsBadRequest_WhenUserOrToolMissingOrDisabled));

        var user = new User { UserId = 1, Username = "u1", Password = "p", Role = "User" };
        var toolDisabled = new Tool { ToolId = 2, CategoryId = 1, Name = "Disabled", Slug = "dis", Description = "d", Icon = "i", ComponentUrl = "/d", IsEnabled = false };
        context.Users.Add(user);
        context.Tools.Add(toolDisabled);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // User does not exist
        var missingUserController = new FavoritesController(context)
        {
            ControllerContext = CreateUserContext(999)
        };
        var res1 = await missingUserController.AddFavorite(2);
        Assert.IsType<BadRequestObjectResult>(res1);

        var validUserController = new FavoritesController(context)
        {
            ControllerContext = CreateUserContext(1)
        };

        // Tool does not exist
        var res2 = await validUserController.AddFavorite(999);
        Assert.IsType<BadRequestObjectResult>(res2);

        // Tool is disabled
        var res3 = await validUserController.AddFavorite(2);
        Assert.IsType<BadRequestObjectResult>(res3);
    }

    [Fact]
    public async Task ToolService_WithUserId_PopulatesIsFavoriteCorrectly()
    {
        using var context = CreateInMemoryContext(nameof(ToolService_WithUserId_PopulatesIsFavoriteCorrectly));

        var cat = new Category { CategoryId = 1, Name = "Converters" };
        var tool1 = new Tool { ToolId = 1, CategoryId = 1, Name = "T1", Slug = "t1", Description = "d1", Icon = "i1", ComponentUrl = "/t1", IsEnabled = true };
        var tool2 = new Tool { ToolId = 2, CategoryId = 1, Name = "T2", Slug = "t2", Description = "d2", Icon = "i2", ComponentUrl = "/t2", IsEnabled = true };
        var fav = new FavoriteTool { UserId = 10, ToolId = 1 };

        context.Categories.Add(cat);
        context.Tools.AddRange(tool1, tool2);
        context.FavoriteTools.Add(fav);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var toolService = new ToolService(context);

        // Grouped tools with userId
        var grouped = (await toolService.GetGroupedEnabledToolsAsync(10)).ToList();
        var singleGrouped = Assert.Single(grouped);
        var tools = singleGrouped.Tools.ToList();
        Assert.Equal(2, tools.Count);
        Assert.True(tools.First(t => t.ToolId == 1).IsFavorite);
        Assert.False(tools.First(t => t.ToolId == 2).IsFavorite);

        // GetToolBySlug with userId
        var slugTool1 = await toolService.GetToolBySlugAsync("t1", 10);
        Assert.NotNull(slugTool1);
        Assert.True(slugTool1.IsFavorite);

        var slugTool2 = await toolService.GetToolBySlugAsync("t2", 10);
        Assert.NotNull(slugTool2);
        Assert.False(slugTool2.IsFavorite);
    }
}
