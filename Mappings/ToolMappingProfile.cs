using AutoMapper;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class ToolMappingProfile : Profile
{
    public ToolMappingProfile()
    {
        // Tool Entity -> ToolSummaryDto
        CreateMap<Tool, ToolSummaryDto>(); // Slug should map automatically by name

        // Tool Entity -> ToolDetailsDto
        CreateMap<Tool, ToolDetailsDto>();

        // CreateToolDto -> Tool Entity (IGNORE Slug - it will be generated)
        CreateMap<CreateToolDto, Tool>()
            .ForMember(dest => dest.Slug, opt => opt.Ignore()); // Don't map from DTO
    }
}