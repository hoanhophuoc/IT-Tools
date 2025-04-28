using AutoMapper;
using IT_Tools.Dtos.Admin;
using IT_Tools.Dtos.Auth;
using IT_Tools.Dtos.Categories;
using IT_Tools.Dtos.Tools;
using IT_Tools.Dtos.User;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class AdminMappingProfile : Profile
{
    public AdminMappingProfile()
    {
        // Map Tool Entity to AdminToolDto
        CreateMap<Tool, AdminToolDto>()
           .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));

        // Map CreateUpgradeRequestDto to UpgradeRequest Entity
        CreateMap<CreateUpgradeRequestDto, UpgradeRequest>();

        // Map UpgradeRequest Entity to UpgradeRequestDto
        CreateMap<UpgradeRequest, UpgradeRequestDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : "N/A")); // Map username from included User

        // Map User Entity to AdminUserDto
        CreateMap<User, AdminUserDto>();

        // Map Category Entity to AdminCategoryDto
        CreateMap<Category, AdminCategoryDto>();
        // CreateToolDto -> Tool Entity (IGNORE Slug - it will be generated)

        CreateMap<CreateToolDto, Tool>()
            .ForMember(dest => dest.Slug, opt => opt.Ignore()) // Slug is generated in service
            .ForMember(dest => dest.CategoryId, opt => opt.Ignore()) // CategoryId is looked up in service
            .ForMember(dest => dest.Category, opt => opt.Ignore()) // Ignore navigation property during mapping
            .ForMember(dest => dest.FavoriteTools, opt => opt.Ignore()) // Ignore collections
            .ForMember(dest => dest.ToolId, opt => opt.Ignore()) // Ignore PK
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Ignore timestamp (DB default or service sets)
    }
}