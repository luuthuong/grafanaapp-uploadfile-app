using Microsoft.EntityFrameworkCore;

public class IngestionDbContext : DbContext
{
    public IngestionDbContext(DbContextOptions<IngestionDbContext> options) : base(options) { }

    public DbSet<IngestionFile> IngestionFiles { get; set; }
    public DbSet<IngestionMetadata> IngestionMetadata { get; set; }
}