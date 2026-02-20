using Infrastructure;
using pHishbone.Extensions;
using pHishbone.Middleware;
using Serilog;

// Configure Serilog early to catch startup errors
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Information)
    .MinimumLevel.Override("Microsoft.AspNetCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/pHishbone-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting pHishbone API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog for logging, reading from the configuration
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // Add services to the container.
    builder.Services.AddControllers();

    // Add HttpContextAccessor (required for CurrentUserService)
    builder.Services.AddHttpContextAccessor();

    // Add Infrastructure services (DbContext, Supabase, UnitOfWork, Repositories, Auth)
    builder.Services.AddInfrastructure(builder.Configuration);

    // Add Application services (AutoMapper, FluentValidation)
    builder.Services.AddApplicationServices();

    // Add CORS
    builder.Services.AddCorsPolicy();

    // Add JWT Authentication
    builder.Services.AddJwtAuthentication(builder.Configuration);

    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        // Add JWT Bearer authentication to Swagger
        options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme.\r\n\r\nEnter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGci...\""
        });

        options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        // Fix for nested classes with duplicate names
        options.CustomSchemaIds(type =>
        {
            string GetName(Type t)
            {
                if (!t.IsGenericType) return t.Name;

                var name = t.Name;
                if (name.Contains('`'))
                {
                    name = name.Substring(0, name.IndexOf('`'));
                }

                var args = t.GetGenericArguments().Select(GetName);
                return $"{name}Of{string.Join("", args)}";
            }

            var schemaId = GetName(type);

            if (type.DeclaringType != null)
            {
                return $"{type.DeclaringType.Name}{schemaId}";
            }
            return schemaId;
        });
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Serilog request logging
    app.UseSerilogRequestLogging();

    // Global exception handling middleware
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseMiddleware<SupabaseExceptionMiddleware>();

    app.UseHttpsRedirection();

    app.UseCors("AllowAll");

    // Authentication must come BEFORE Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException
                           && ex.Source != "Microsoft.EntityFrameworkCore.Design")
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
