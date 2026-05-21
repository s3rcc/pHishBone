using Application.Common.Interfaces;
using Application.Services;
using CloudinaryDotNet;
using Infrastructure.Common.Interfaces;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Repositories;
using Infrastructure.Services;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using StackExchange.Redis;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddMemoryCache();

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

            // Configure Redis distributed cache
            var redisSettings = configuration.GetSection("RedisSettings").Get<RedisSettings>();
            if (redisSettings is { Enabled: true } && !string.IsNullOrWhiteSpace(redisSettings.ConnectionString))
            {
                services.Configure<RedisSettings>(configuration.GetSection("RedisSettings"));

                var redisConfiguration = BuildRedisConfiguration(redisSettings);

                if (TryConnectToRedis(redisConfiguration, out var redisConnection))
                {
                    services.AddStackExchangeRedisCache(options =>
                    {
                        options.ConfigurationOptions = redisConfiguration;
                        options.InstanceName = redisSettings.InstanceName;
                    });

                    // Register IConnectionMultiplexer for prefix-based cache invalidation
                    services.AddSingleton<IConnectionMultiplexer>(redisConnection);
                }
                else
                {
                    services.AddDistributedMemoryCache();
                }
            }
            else
            {
                // Fallback to in-memory cache when Redis is not configured
                services.AddDistributedMemoryCache();
            }

            // Register cache service as Singleton (per SKILL.md convention)
            services.AddSingleton<ICacheService, RedisCacheService>();

            // Add Unit of Work and Repositories
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            // Add Services
            services.AddScoped<IAuthService, SupabaseAuthService>();
            services.AddScoped<ITokenBlacklistService, TokenBlacklistService>();
            services.AddScoped<ITagService, TagService>();
            services.AddScoped<ITypeService, TypeService>();
            services.AddScoped<ISpeciesService, SpeciesService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<ITankService, TankService>();
            services.AddScoped<ITankItemService, TankItemService>();
            services.AddScoped<ITankAnalysisService, TankAnalysisService>();
            services.AddScoped<IGuestTankAnalysisService, GuestTankAnalysisService>();
            services.AddScoped<ISpeciesImageService, SpeciesImageService>();
            services.AddScoped<ITankImageService, TankImageService>();
            services.AddScoped<IPhotoService, PhotoService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICompatibilityRuleService, CompatibilityRuleService>();
            services.AddScoped<ISpeciesBookmarkService, SpeciesBookmarkService>();
            services.AddTransient<IClaimsTransformation, UserRoleClaimsTransformation>();

            return services;
        }

        private static ConfigurationOptions BuildRedisConfiguration(RedisSettings redisSettings)
        {
            var options = ConfigurationOptions.Parse(redisSettings.ConnectionString);
            options.AbortOnConnectFail = false;
            options.ConnectRetry = 1;
            options.ConnectTimeout = redisSettings.ConnectTimeoutMs;
            options.SyncTimeout = redisSettings.OperationTimeoutMs;
            options.AsyncTimeout = redisSettings.OperationTimeoutMs;

            return options;
        }

        private static bool TryConnectToRedis(
            ConfigurationOptions redisConfiguration,
            out IConnectionMultiplexer redisConnection)
        {
            try
            {
                redisConnection = ConnectionMultiplexer.Connect(redisConfiguration);

                if (redisConnection.IsConnected)
                {
                    Log.Information(
                        "Redis cache is available. Endpoints={Endpoints}",
                        string.Join(", ", redisConfiguration.EndPoints.Select(endpoint => endpoint.ToString())));
                    return true;
                }

                redisConnection.Dispose();
                Log.Warning("Redis reported a disconnected state during startup. Falling back to in-memory distributed cache.");
            }
            catch (Exception ex)
            {
                Log.Warning(ex, "Redis is unavailable during startup. Falling back to in-memory distributed cache.");
            }

            redisConnection = null!;
            return false;
        }
    }
}

