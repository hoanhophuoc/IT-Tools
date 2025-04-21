using AutoMapper;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class ToolMappingProfile : Profile
{
    public ToolMappingProfile()
    {
        // Map: Entity -> DTO (for reading data)
        CreateMap<Tool, ToolSummaryDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null)); // Handle Category Name

        CreateMap<Tool, ToolDetailsDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null)); // Handle Category Name

        // Map: DTO -> Entity (for creating data)
        CreateMap<CreateToolDto, Tool>(); // AutoMapper maps matching property names
    }
}