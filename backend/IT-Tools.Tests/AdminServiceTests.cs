using IT_Tools.Data;
using IT_Tools.Dtos.Admin;
using IT_Tools.Models;
using IT_Tools.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace IT_Tools.Tests;

public class AdminServiceTests
{
    private static PostgreSQLContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<PostgreSQLContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new PostgreSQLContext(options);
    }

    [Fact]
    public async Task AdminService_GetAllToolsAndCategories_ReturnsCompleteList()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_GetAllToolsAndCategories_ReturnsCompleteList));

        var cat = new Category { CategoryId = 1, Name = "AdminCat" };
        var tool = new Tool
        {
            ToolId = 1,
            CategoryId = 1,
            Name = "AdminTool",
            Slug = "admin-tool",
            Description = "Desc",
            Icon = "icon.svg",
            ComponentUrl = "/admin-tool",
            IsEnabled = false // Should still be returned in Admin view
        };
        context.Categories.Add(cat);
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var adminService = new AdminService(context);

        var tools = (await adminService.GetAllToolsAsync()).ToList();
        var toolResult = Assert.Single(tools);
        Assert.Equal("AdminTool", toolResult.Name);
        Assert.False(toolResult.IsEnabled);

        var categories = (await adminService.GetCategoriesAsync()).ToList();
        var catResult = Assert.Single(categories);
        Assert.Equal("AdminCat", catResult.Name);
    }

    [Fact]
    public async Task AdminService_ProcessUpgradeRequestAsync_ApproveUpdatesUserRoleToPremium()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_ProcessUpgradeRequestAsync_ApproveUpdatesUserRoleToPremium));

        var user = new User { UserId = 10, Username = "standardUser", Password = "pwd", Role = "User" };
        var request = new UpgradeRequest
        {
            RequestId = 100,
            UserId = 10,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };
        context.Users.Add(user);
        context.UpgradeRequests.Add(request);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var adminService = new AdminService(context);

        var updateDto = new ProcessUpgradeRequestDto { NewStatus = "Approved" };
        var success = await adminService.ProcessUpgradeRequestAsync(100, updateDto);

        Assert.True(success);

        var updatedUser = await context.Users.FindAsync([10], TestContext.Current.CancellationToken);
        Assert.NotNull(updatedUser);
        Assert.Equal("Premium", updatedUser.Role);

        var updatedRequest = await context.UpgradeRequests.FindAsync([100], TestContext.Current.CancellationToken);
        Assert.NotNull(updatedRequest);
        Assert.Equal("Approved", updatedRequest.Status);
    }

    [Fact]
    public async Task AdminService_ProcessUpgradeRequestAsync_ReturnsFalseWhenNotFoundOrNotPending()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_ProcessUpgradeRequestAsync_ReturnsFalseWhenNotFoundOrNotPending));

        var requestProcessed = new UpgradeRequest
        {
            RequestId = 101,
            UserId = 1,
            Status = "Rejected",
            RequestedAt = DateTime.UtcNow
        };
        context.UpgradeRequests.Add(requestProcessed);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var adminService = new AdminService(context);

        // Not found
        var notFound = await adminService.ProcessUpgradeRequestAsync(999, new ProcessUpgradeRequestDto { NewStatus = "Approved" });
        Assert.False(notFound);

        // Already processed (status != Pending)
        var notPending = await adminService.ProcessUpgradeRequestAsync(101, new ProcessUpgradeRequestDto { NewStatus = "Approved" });
        Assert.False(notPending);
    }

    [Fact]
    public async Task AdminService_GetPendingUpgradeRequestsAndGetAllUsers_ReturnsCorrectData()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_GetPendingUpgradeRequestsAndGetAllUsers_ReturnsCorrectData));

        var user1 = new User { UserId = 1, Username = "userOne", Password = "p1", Role = "User", CreatedAt = DateTime.UtcNow };
        var user2 = new User { UserId = 2, Username = "userTwo", Password = "p2", Role = "Admin", CreatedAt = DateTime.UtcNow };
        var req1 = new UpgradeRequest { RequestId = 1, UserId = 1, Status = "Pending", RequestedAt = DateTime.UtcNow };
        var req2 = new UpgradeRequest { RequestId = 2, UserId = 2, Status = "Approved", RequestedAt = DateTime.UtcNow };

        context.Users.AddRange(user1, user2);
        context.UpgradeRequests.AddRange(req1, req2);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var adminService = new AdminService(context);

        var pending = (await adminService.GetPendingUpgradeRequestsAsync()).ToList();
        var singlePending = Assert.Single(pending);
        Assert.Equal(1, singlePending.RequestId);
        Assert.Equal("userOne", singlePending.Username);

        var users = (await adminService.GetAllUsersAsync()).ToList();
        Assert.Equal(2, users.Count);
        Assert.Contains(users, u => u.Username == "userOne" && u.Role == "User");
        Assert.Contains(users, u => u.Username == "userTwo" && u.Role == "Admin");
    }

    [Fact]
    public async Task AdminService_CreateToolAsync_ValidatesInputAndHandlesCategoriesAndDuplicates()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_CreateToolAsync_ValidatesInputAndHandlesCategoriesAndDuplicates));
        var adminService = new AdminService(context);

        // Empty category name returns false
        var invalidCat = await adminService.CreateToolAsync(new IT_Tools.Dtos.Tools.CreateToolDto
        {
            Name = "My Tool",
            CategoryName = "   ",
            ComponentUrl = "/tool"
        });
        Assert.False(invalidCat);

        // Create tool with new category
        var created1 = await adminService.CreateToolAsync(new IT_Tools.Dtos.Tools.CreateToolDto
        {
            Name = "JSON Validator!",
            CategoryName = "Development",
            Description = "Validates JSON",
            Icon = "json.svg",
            ComponentUrl = "/json-val",
            IsEnabled = true,
            IsPremium = false
        });
        Assert.True(created1);

        // Category was created
        var cat = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Development", TestContext.Current.CancellationToken);
        Assert.NotNull(cat);

        // Creating duplicate tool (same name / slug) returns false
        var dupTool = await adminService.CreateToolAsync(new IT_Tools.Dtos.Tools.CreateToolDto
        {
            Name = "json validator",
            CategoryName = "Development",
            ComponentUrl = "/json-val-2"
        });
        Assert.False(dupTool);

        // Create second tool under existing category (case insensitive match)
        var created2 = await adminService.CreateToolAsync(new IT_Tools.Dtos.Tools.CreateToolDto
        {
            Name = "SQL Formatter",
            CategoryName = "development",
            ComponentUrl = "/sql-format"
        });
        Assert.True(created2);
        Assert.Equal(1, await context.Categories.CountAsync(TestContext.Current.CancellationToken)); // No duplicate category created
    }

    [Fact]
    public async Task AdminService_UpdateToolAndDeleteTool_HandlesSuccessAndNotFound()
    {
        using var context = CreateInMemoryContext(nameof(AdminService_UpdateToolAndDeleteTool_HandlesSuccessAndNotFound));

        var cat1 = new Category { CategoryId = 1, Name = "Cat1" };
        var cat2 = new Category { CategoryId = 2, Name = "Cat2" };
        var tool = new Tool
        {
            ToolId = 5,
            CategoryId = 1,
            Name = "Initial Tool",
            Slug = "initial-tool",
            Description = "Initial",
            Icon = "icon.svg",
            ComponentUrl = "/init",
            IsEnabled = true,
            IsPremium = false
        };

        context.Categories.AddRange(cat1, cat2);
        context.Tools.Add(tool);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var adminService = new AdminService(context);

        // Update non-existent tool
        var updateNotFound = await adminService.UpdateToolAsync(999, new IT_Tools.Dtos.Tools.UpdateToolDto
        {
            Name = "Doesn't exist",
            CategoryName = "Cat1",
            ComponentUrl = "/none"
        });
        Assert.False(updateNotFound);

        // Update existing tool with new category
        var updateSuccess = await adminService.UpdateToolAsync(5, new IT_Tools.Dtos.Tools.UpdateToolDto
        {
            Name = "Updated Tool",
            CategoryName = "Cat2",
            Description = "Updated Desc",
            Icon = "updated.svg",
            ComponentUrl = "/updated",
            IsEnabled = false,
            IsPremium = true
        });
        Assert.True(updateSuccess);

        var updated = await context.Tools.FindAsync([5], TestContext.Current.CancellationToken);
        Assert.NotNull(updated);
        Assert.Equal("Updated Tool", updated.Name);
        Assert.Equal(2, updated.CategoryId);
        Assert.False(updated.IsEnabled);
        Assert.True(updated.IsPremium);

        // Delete non-existent tool
        var deleteNotFound = await adminService.DeleteToolAsync(999);
        Assert.False(deleteNotFound);

        // Delete existing tool
        var deleteSuccess = await adminService.DeleteToolAsync(5);
        Assert.True(deleteSuccess);
        Assert.Null(await context.Tools.FindAsync([5], TestContext.Current.CancellationToken));
    }
}
