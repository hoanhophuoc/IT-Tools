using AutoMapper;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        // Map: DTO -> Entity (for registration)
        CreateMap<RegisterRequestDto, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.Ignore())      // Ignore role during mapping
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // Map: Entity -> DTO (for Login Response - Token is set separately)
        CreateMap<User, LoginResponseDto>();

        // Map: DTO -> Entity (for password change)
        CreateMap<ChangePasswordRequestDto, User>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Username, opt => opt.Ignore()) 
            .ForMember(dest => dest.Role, opt => opt.Ignore())    
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // Map: DTO -> Entity (for forgot password)
        CreateMap<ForgotPasswordRequestDto, User>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Username, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());
    }
}