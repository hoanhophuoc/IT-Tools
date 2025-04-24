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
    }
}