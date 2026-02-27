using Application.Common.Interfaces;
using Application.Services;
using CloudinaryDotNet;
using Infrastructure.Common.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Services;
using Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Add DbContext with PostgreSQL
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Database connection string is missing");
            }


            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

            // Configure Supabase settings
            var supabaseSettings = configuration.GetSection("Supabase").Get<SupabaseSettings>();

            if (supabaseSettings == null || string.IsNullOrEmpty(supabaseSettings.Url) || string.IsNullOrEmpty(supabaseSettings.Key))
            {
                throw new InvalidOperationException("Supabase configuration is missing or incomplete");
            }

            services.Configure<SupabaseSettings>(options =>
                configuration.GetSection("Supabase").Bind(options));

            // Add Supabase client
            services.AddScoped(_ =>
            {
                var options = new Supabase.SupabaseOptions
                {
                    AutoRefreshToken = true,
                    AutoConnectRealtime = false
                };

                var supabase = new Supabase.Client(supabaseSettings.Url, supabaseSettings.Key, options);
                supabase.InitializeAsync().Wait();
                return supabase;
            });

            // Configure Cloudinary
            services.Configure<CloudinarySettings>(configuration.GetSection("CloudinarySettings"));

            // Add Unit of Work and Repositories
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            // Add Services
            services.AddScoped<IAuthService, SupabaseAuthService>();
            services.AddScoped<ITagService, TagService>();
            services.AddScoped<ITypeService, TypeService>();
            services.AddScoped<ISpeciesService, SpeciesService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<ITankService, TankService>();
            services.AddScoped<ITankItemService, TankItemService>();
            services.AddScoped<ISpeciesImageService, SpeciesImageService>();
            services.AddScoped<ITankImageService, TankImageService>();
            services.AddScoped<IPhotoService, PhotoService>();
            services.AddScoped<IUserService, UserService>();

            return services;
        }
    }
}

