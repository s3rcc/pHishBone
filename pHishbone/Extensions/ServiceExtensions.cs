using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Security.Claims;
using System.Text;

namespace pHishbone.Extensions
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Add AutoMapper
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // Add FluentValidation
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(Assembly.Load("Application"));

            return services;
        }

        public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

            return services;
        }

        /// <summary>
        /// Configures JWT Bearer authentication for Supabase tokens.
        /// Validates tokens using Supabase JWT secret.
        /// </summary>
        public static IServiceCollection AddJwtAuthentication(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var jwtSecret = configuration["Supabase:JwtSecret"];

            if (string.IsNullOrEmpty(jwtSecret))
            {
                throw new InvalidOperationException(
                    "Supabase JWT Secret is missing in configuration. " +
                    "Please add 'Supabase:JwtSecret' to appsettings.json");
            }

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSecret)),
                    ValidateIssuer = false, // Supabase doesn't require issuer validation
                    ValidateAudience = true,
                    ValidAudience = "authenticated", // Supabase default audience
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero // No tolerance for expired tokens
                };

                // Map Supabase JWT claims to ASP.NET Core claims
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        if (context.Principal?.Identity is ClaimsIdentity identity)
                        {
                            // Map 'sub' claim to NameIdentifier
                            var subClaim = identity.FindFirst("sub");
                            if (subClaim != null && !identity.HasClaim(ClaimTypes.NameIdentifier, subClaim.Value))
                            {
                                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, subClaim.Value));
                            }

                            // Map 'email' claim
                            var emailClaim = identity.FindFirst("email");
                            if (emailClaim != null && !identity.HasClaim(ClaimTypes.Email, emailClaim.Value))
                            {
                                identity.AddClaim(new Claim(ClaimTypes.Email, emailClaim.Value));
                            }

                            // Map 'role' or 'app_metadata.role' to Role claim
                            var roleClaim = identity.FindFirst("role") ?? identity.FindFirst("app_metadata.role");
                            if (roleClaim != null && !identity.HasClaim(ClaimTypes.Role, roleClaim.Value))
                            {
                                identity.AddClaim(new Claim(ClaimTypes.Role, roleClaim.Value));
                            }
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }
    }
}
