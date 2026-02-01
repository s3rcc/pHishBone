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
builder.Services.AddSwaggerGen();

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
