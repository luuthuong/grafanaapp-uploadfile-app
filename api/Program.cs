using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });
});

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.Authority = "https://<KEYCLOAK_DOMAIN>/realms/<REALM_NAME>";
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateAudience = false
        };
    });

builder.Services.AddControllers();  // ✅ use controllers instead of AddMvc()
builder.Services.AddAuthorization();

string connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine(connectionString);

builder.Services.AddDbContext<IngestionDbContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddHealthChecks();

builder.Services.AddCors(config =>
{
    config.AddPolicy("AllowAll", options =>
    {
        options.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure pipeline
// if (app.Environment.IsDevelopment())
// {
// }
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseCors("AllowAll");  // ✅ use CORS policy

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();   // ✅ enable attribute-routed controllers

var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<IngestionDbContext>();
await dbContext.Database.MigrateAsync();

app.Run();

