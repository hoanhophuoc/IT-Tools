using AutoMapper;
using IT_Tools.Dtos.User;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class UserMappingProfile : Profile
{
    public UserMappingProfile() =>
        // Map CreateUpgradeRequestDto to UpgradeRequest Entity
        CreateMap<CreateUpgradeRequestDto, UpgradeRequest>();
}