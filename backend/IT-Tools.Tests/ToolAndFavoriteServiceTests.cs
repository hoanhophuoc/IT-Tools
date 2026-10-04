using IT_Tools.Data;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.EntityFrameworkCore;
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
        await context.SaveChangesAsync();

        var toolService = new ToolService(context);
        var categories = (await toolService.GetGroupedEnabledToolsAsync(null)).ToList();

        Assert.Single(categories); // Only cat1 has enabled tools, cat2 empty excluded
        Assert.Equal("Converters", categories[0].Name);
        Assert.Single(categories[0].Tools);
        Assert.Equal("Base64 Converter", categories[0].Tools[0].Name);
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
        await context.SaveChangesAsync();

        var toolService = new ToolService(context);

        var found = await toolService.GetToolBySlugAsync("color-converter", null);
        Assert.NotNull(found);
        Assert.Equal("Color Converter", found.Name);

        var notFound = await toolService.GetToolBySlugAsync("non-existent-tool", null);
        Assert.Null(notFound);
    }

    [Fact]
    public async Task FavoriteService_AddAndRemoveFavorite_ManagesFavoritesCorrectly()
    {
        using var context = CreateInMemoryContext(nameof(FavoriteService_AddAndRemoveFavorite_ManagesFavoritesCorrectly));

        var user = new User { UserId = 1, Username = "favUser", Password = "pwd", Role = "User" };
        var tool = new Tool { ToolId = 50, CategoryId = 1, Name = "FavTool", Slug = "fav-tool", Description = "Fav", Icon = "fav.svg", ComponentUrl = "/fav", IsEnabled = true };
        context.Users.Add(user);
        context.Tools.Add(tool);
        await context.SaveChangesAsync();

        var favService = new FavoriteService(context);

        // Add Favorite
        var addResult = await favService.AddFavoriteAsync(1, 50);
        Assert.True(addResult);

        // Verify it exists
        var favorites = (await favService.GetUserFavoritesAsync(1)).ToList();
        Assert.Single(favorites);
        Assert.Equal("FavTool", favorites[0].Name);

        // Adding duplicate favorite returns false without duplicating
        var addDup = await favService.AddFavoriteAsync(1, 50);
        Assert.False(addDup);
        var favoritesAfterDup = (await favService.GetUserFavoritesAsync(1)).ToList();
        Assert.Single(favoritesAfterDup);

        // Remove Favorite
        var removeResult = await favService.RemoveFavoriteAsync(1, 50);
        Assert.True(removeResult);

        var favoritesAfterRemove = (await favService.GetUserFavoritesAsync(1)).ToList();
        Assert.Empty(favoritesAfterRemove);

        // Remove non-existent favorite returns false
        var removeNotFound = await favService.RemoveFavoriteAsync(1, 999);
        Assert.False(removeNotFound);
    }

    [Fact]
    public async Task FavoriteService_AddFavoriteAsync_ReturnsFalse_WhenUserOrToolMissingOrDisabled()
    {
        using var context = CreateInMemoryContext(nameof(FavoriteService_AddFavoriteAsync_ReturnsFalse_WhenUserOrToolMissingOrDisabled));

        var user = new User { UserId = 1, Username = "u1", Password = "p", Role = "User" };
        var toolDisabled = new Tool { ToolId = 2, CategoryId = 1, Name = "Disabled", Slug = "dis", Description = "d", Icon = "i", ComponentUrl = "/d", IsEnabled = false };
        context.Users.Add(user);
        context.Tools.Add(toolDisabled);
        await context.SaveChangesAsync();

        var favService = new FavoriteService(context);

        // User does not exist
        Assert.False(await favService.AddFavoriteAsync(999, 2));

        // Tool does not exist
        Assert.False(await favService.AddFavoriteAsync(1, 999));

        // Tool is disabled
        Assert.False(await favService.AddFavoriteAsync(1, 2));
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
        await context.SaveChangesAsync();

        var toolService = new ToolService(context);

        // Grouped tools with userId
        var grouped = (await toolService.GetGroupedEnabledToolsAsync(10)).ToList();
        Assert.Single(grouped);
        var tools = grouped[0].Tools.ToList();
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
