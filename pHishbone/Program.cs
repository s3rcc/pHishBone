using Infrastructure;
using pHishbone.Extensions;
using pHishbone.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add Infrastructure services (DbContext, Supabase, UnitOfWork, Repositories, Auth)
builder.Services.AddInfrastructure(builder.Configuration);

// Add Application services (AutoMapper, FluentValidation)
builder.Services.AddApplicationServices();

// Add CORS
builder.Services.AddCorsPolicy();

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

// Global exception handling middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseMiddleware<SupabaseExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
