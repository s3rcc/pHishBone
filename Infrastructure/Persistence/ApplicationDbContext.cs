using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<PBUser> PBUsers { get; set; }
        public DbSet<SpeciesBookmark> SpeciesBookmarks { get; set; }

        // Catalog Module DbSets
        public DbSet<Domain.Entities.Catalog.Type> CatalogTypes { get; set; }
        public DbSet<Domain.Entities.Catalog.Species> Species { get; set; }
        public DbSet<Domain.Entities.Catalog.SpeciesEnvironment> SpeciesEnvironments { get; set; }
        public DbSet<Domain.Entities.Catalog.SpeciesProfile> SpeciesProfiles { get; set; }
        public DbSet<Domain.Entities.Catalog.Tag> Tags { get; set; }
        public DbSet<Domain.Entities.Catalog.SpeciesTag> SpeciesTags { get; set; }
        public DbSet<Domain.Entities.Catalog.CompatibilityRule> CompatibilityRules { get; set; }
        public DbSet<Domain.Entities.Ai.AiModelConfig> AiModelConfigs { get; set; }
        public DbSet<Domain.Entities.Ai.AiPromptTemplate> AiPromptTemplates { get; set; }

        // Project Module DbSets
        public DbSet<Domain.Entities.Project.Tank> Tanks { get; set; }
        public DbSet<Domain.Entities.Project.TankItem> TankItems { get; set; }
        public DbSet<Domain.Entities.Project.TankSnapshot> TankSnapshots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Apply all entity configurations from this assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

    }
}
