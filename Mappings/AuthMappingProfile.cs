using AutoMapper;
using IT_Tools.Dtos.Auth;
using IT_Tools.Models;

namespace IT_Tools.Mappings;

public class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        // Map: DTO -> Entity (for registration)
        // Password must be handled separately (hashing) in the service
        // Role should be set explicitly in the service
        CreateMap<RegisterRequestDto, User>()
            .ForMember(dest => dest.Password, opt => opt.Ignore()) // Ignore password during mapping
            .ForMember(dest => dest.Role, opt => opt.Ignore())      // Ignore role during mapping
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Ignore created_at during mapping

        // Map: Entity -> DTO (for Login Response - Token is set separately)
        CreateMap<User, LoginResponseDto>();

        // Map: DTO -> Entity (for password change)
        CreateMap<ChangePasswordRequestDto, User>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Ignore UserId during mapping
            .ForMember(dest => dest.Username, opt => opt.Ignore()) // Ignore Username during mapping
            .ForMember(dest => dest.Role, opt => opt.Ignore())     // Ignore Role during mapping
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Ignore CreatedAt during mapping

        // Map: DTO -> Entity (for forgot password)
        CreateMap<ForgotPasswordRequestDto, User>()
            .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Ignore UserId during mapping
            .ForMember(dest => dest.Username, opt => opt.Ignore()) // Ignore Username during mapping
            .ForMember(dest => dest.Role, opt => opt.Ignore())     // Ignore Role during mapping
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Ignore CreatedAt during mapping
    }
}