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

        CreateMap<CreateUpgradeRequestDto, UpgradeRequest>();

        CreateMap<UpgradeRequest, UpgradeRequestDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : "N/A"));

        CreateMap<User, AdminUserDto>();

        CreateMap<Category, AdminCategoryDto>();

        CreateMap<CreateToolDto, Tool>()
            .ForMember(dest => dest.Slug, opt => opt.Ignore())
            .ForMember(dest => dest.CategoryId, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.FavoriteTools, opt => opt.Ignore())
            .ForMember(dest => dest.ToolId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        CreateMap<UpdateToolDto, Tool>()
            .ForMember(dest => dest.CategoryId, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore());
    }
}