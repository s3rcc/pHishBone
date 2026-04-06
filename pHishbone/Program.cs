using Infrastructure;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using pHishbone.Extensions;
using pHishbone.Middleware;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerGen;

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
    builder.Services.AddAiInfrastructure(builder.Configuration);

    // Add Application services (AutoMapper, FluentValidation)
    builder.Services.AddApplicationServices();

    // Add CORS
    builder.Services.AddCorsPolicy(builder.Configuration);

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

        // Add enum name annotations (x-enumNames) for frontend readability
        options.SchemaFilter<EnumSchemaFilter>();

        // Include XML comments from the pHishbone API project
        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (System.IO.File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath);
        }
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

/// <summary>
/// Swagger schema filter that annotates enum schemas with their string names
/// using the x-enumNames extension. This makes enum values human-readable
/// for frontend developers without changing the wire format (integers).
/// </summary>
public class EnumSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (!context.Type.IsEnum) return;

        var enumNames = Enum.GetNames(context.Type);
        var enumValues = Enum.GetValues(context.Type).Cast<int>().ToArray();

        // Add x-enumNames extension for tools that support it (e.g. NSwag, OpenAPI Generator)
        schema.Extensions["x-enumNames"] = new OpenApiArray();
        var nameArray = (OpenApiArray)schema.Extensions["x-enumNames"];
        foreach (var name in enumNames)
        {
            nameArray.Add(new OpenApiString(name));
        }

        // Add x-enum-varnames (alternative convention used by some generators)
        schema.Extensions["x-enum-varnames"] = new OpenApiArray();
        var varNames = (OpenApiArray)schema.Extensions["x-enum-varnames"];
        foreach (var name in enumNames)
        {
            varNames.Add(new OpenApiString(name));
        }

        // Annotate the description with the enum mappings
        var mappings = enumValues.Zip(enumNames, (v, n) => $"{v} = {n}");
        schema.Description = (schema.Description ?? "") +
            " Values: " + string.Join(", ", mappings);
    }
}
