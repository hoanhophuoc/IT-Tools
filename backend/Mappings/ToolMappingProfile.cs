using AutoMapper;
using IT_Tools.Dtos.Tools;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class ToolMappingProfile : Profile
{
    public ToolMappingProfile()
    {
        CreateMap<Tool, ToolSummaryDto>()
            .ForMember(dest => dest.IsFavorite, opt => opt.Ignore());

        CreateMap<Tool, ToolDetailsDto>()
            .ForMember(dest => dest.IsFavorite, opt => opt.Ignore());
    }
}