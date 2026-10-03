using AutoMapper;
using IT_Tools.Dtos.Categories;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class CategoryMappingProfile : Profile
{
    public CategoryMappingProfile() => CreateMap<Category, CategoryWithToolsDto>()
                                            .ForMember(dest => dest.Tools, opt => opt.MapFrom(src =>
                                                src.Tools.Where(t => t.IsEnabled).OrderBy(t => t.Name)
                                            ));
}