using IT_Tools.Controllers;
using IT_Tools.Data;
using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace IT_Tools.Tests;

public class AdminControllerTests
{
    private static PostgreSQLContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PostgreSQLContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PostgreSQLContext(options);
    }

    [Fact]
    public async Task GetAllTools_ReturnsOkWithToolList()
    {
        using var context = CreateContext(nameof(GetAllTools_ReturnsOkWithToolList));
        var cat = new Category { CategoryId = 1, Name = "Converters" };
        var tool = new Tool
        {
            ToolId = 1,
            CategoryId = 1,
            Name = "Color Converter",
            Slug = "color-converter",
            Description = "Color converter",
            Icon = "color.svg",
            ComponentUrl = "/tools/color",
            IsEnabled = true,
            IsPremium = false
        };
        context.Categories.Add(cat);
        context.Tools.Add(tool);
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var result = await controller.GetAllTools();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var tools = Assert.IsAssignableFrom<IEnumerable<AdminToolDto>>(okResult.Value);
        Assert.Single(tools);
    }

    [Fact]
    public async Task GetAllCategories_ReturnsOkWithCategoryList()
    {
        using var context = CreateContext(nameof(GetAllCategories_ReturnsOkWithCategoryList));
        context.Categories.AddRange(
            new Category { CategoryId = 1, Name = "Crypto" },
            new Category { CategoryId = 2, Name = "Math" }
        );
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var result = await controller.GetAllCategories();

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var categories = Assert.IsAssignableFrom<IEnumerable<AdminCategoryDto>>(okResult.Value);
        Assert.Equal(2, categories.Count());
    }

    [Fact]
    public async Task CreateTool_ReturnsCreated_WhenValid()
    {
        using var context = CreateContext(nameof(CreateTool_ReturnsCreated_WhenValid));
        context.Categories.Add(new Category { CategoryId = 1, Name = "Dev" });
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var dto = new CreateToolDto
        {
            Name = "Port Generator",
            Description = "Random port",
            CategoryName = "Dev",
            ComponentUrl = "tools/development/RandomPortGenerator",
            Icon = "port.svg",
            IsEnabled = true,
            IsPremium = false
        };

        var result = await controller.CreateTool(dto);

        Assert.IsType<CreatedResult>(result);
        var created = await context.Tools.FirstOrDefaultAsync(t => t.Name == "Port Generator");
        Assert.NotNull(created);
    }

    [Fact]
    public async Task UpdateTool_ReturnsNoContent_WhenToolExists()
    {
        using var context = CreateContext(nameof(UpdateTool_ReturnsNoContent_WhenToolExists));
        context.Categories.Add(new Category { CategoryId = 1, Name = "Web" });
        context.Tools.Add(new Tool
        {
            ToolId = 10,
            CategoryId = 1,
            Name = "URL Decoder",
            Slug = "url-decoder",
            Description = "Decode URLs",
            Icon = "url.svg",
            ComponentUrl = "tools/web/UrlEncoderDecoder",
            IsEnabled = true,
            IsPremium = false
        });
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var updateDto = new UpdateToolDto
        {
            Name = "URL Decoder Pro",
            Description = "Updated description",
            CategoryName = "Web",
            ComponentUrl = "tools/web/UrlEncoderDecoder",
            Icon = "url.svg",
            IsEnabled = true,
            IsPremium = true
        };

        var result = await controller.UpdateTool(10, updateDto);

        Assert.IsType<NoContentResult>(result);
        var updated = await context.Tools.FindAsync(10);
        Assert.NotNull(updated);
        Assert.True(updated.IsPremium);
    }

    [Fact]
    public async Task DeleteTool_ReturnsNotFound_WhenToolDoesNotExist()
    {
        using var context = CreateContext(nameof(DeleteTool_ReturnsNotFound_WhenToolDoesNotExist));
        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var result = await controller.DeleteTool(999);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task ProcessUpgradeRequest_Approve_PromotesUserToPremium()
    {
        using var context = CreateContext(nameof(ProcessUpgradeRequest_Approve_PromotesUserToPremium));
        var user = new User { UserId = 5, Username = "upgrader", Password = "hash", Role = "User" };
        var request = new UpgradeRequest
        {
            RequestId = 1,
            UserId = 5,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };
        context.Users.Add(user);
        context.UpgradeRequests.Add(request);
        await context.SaveChangesAsync();

        var adminService = new AdminService(context);
        var controller = new AdminController(adminService);

        var dto = new ProcessUpgradeRequestDto { NewStatus = "Approved" };
        var result = await controller.ProcessUpgradeRequest(1, dto);

        Assert.IsType<NoContentResult>(result);

        var updatedUser = await context.Users.FindAsync(5);
        Assert.Equal("Premium", updatedUser!.Role);
    }
}
