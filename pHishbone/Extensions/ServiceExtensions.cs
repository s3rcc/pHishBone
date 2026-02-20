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
                var supabaseUrl = configuration["Supabase:Url"];
                var jwksUrl = $"{supabaseUrl}/auth/v1/.well-known/jwks.json";

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    // We need to fetch the keys and set them explicitly because some middleware versions
                    // fail to fetch purely from MetadataAddress without full OpenID config
                    IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
                    {
                        var client = new HttpClient();
                        var json = client.GetStringAsync(jwksUrl).Result;
                        var keys = new JsonWebKeySet(json).GetSigningKeys();
                        return keys;
                    },
                    ValidateIssuer = true,
                    ValidIssuer = $"{supabaseUrl}/auth/v1",
                    ValidateAudience = true,
                    ValidAudience = "authenticated",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                // Map Supabase JWT claims to ASP.NET Core claims
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        if (context.Principal?.Identity is ClaimsIdentity identity)
                        {
                            // Map 'sub' → NameIdentifier
                            var subClaim = identity.FindFirst("sub");
                            if (subClaim != null && !identity.HasClaim(ClaimTypes.NameIdentifier, subClaim.Value))
                                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, subClaim.Value));

                            // Map 'email' → Email
                            var emailClaim = identity.FindFirst("email");
                            if (emailClaim != null && !identity.HasClaim(ClaimTypes.Email, emailClaim.Value))
                                identity.AddClaim(new Claim(ClaimTypes.Email, emailClaim.Value));

                            // Map 'role' → Role
                            var roleClaim = identity.FindFirst("role") ?? identity.FindFirst("app_metadata.role");
                            if (roleClaim != null && !identity.HasClaim(ClaimTypes.Role, roleClaim.Value))
                                identity.AddClaim(new Claim(ClaimTypes.Role, roleClaim.Value));
                        }

                        return Task.CompletedTask;
                    },
                    OnAuthenticationFailed = context =>
                    {
                        var logger = context.HttpContext.RequestServices
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("JwtAuthentication");
                        logger.LogError(context.Exception, "JWT Authentication failed");
                        return Task.CompletedTask;
                    },
                    OnChallenge = context =>
                    {
                        var logger = context.HttpContext.RequestServices
                            .GetRequiredService<ILoggerFactory>()
                            .CreateLogger("JwtAuthentication");
                        logger.LogWarning("JWT Challenge triggered. Error: {Error}, Description: {Desc}",
                            context.Error, context.ErrorDescription);
                        return Task.CompletedTask;
                    }
                };
            });

            return services;
        }
    }
}
