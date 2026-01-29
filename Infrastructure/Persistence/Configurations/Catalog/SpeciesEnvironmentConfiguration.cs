using Domain.Entities.Catalog;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the SpeciesEnvironment entity.
    /// Configured as dependent in 1:1 relationship with Species.
    /// Uses Id from BaseEntity as shared PK/FK with Species.
    /// </summary>
    public class SpeciesEnvironmentConfiguration : IEntityTypeConfiguration<SpeciesEnvironment>
    {
        public void Configure(EntityTypeBuilder<SpeciesEnvironment> builder)
        {
            builder.ToTable("SpeciesEnvironment", "catalog");

            // BaseEntity handles PK configuration
            // Id serves as both PK and FK to Species (shared PK/FK pattern)

            builder.Property(se => se.PhMin)
                .IsRequired()
                .HasColumnType("decimal(3,1)");

            builder.Property(se => se.PhMax)
                .IsRequired()
                .HasColumnType("decimal(3,1)");

            builder.Property(se => se.TempMin)
                .IsRequired();

            builder.Property(se => se.TempMax)
                .IsRequired();

            builder.Property(se => se.MinTankVolume)
                .IsRequired();

            // Store enum as string for debuggability
            builder.Property(se => se.WaterType)
                .IsRequired()
                .HasMaxLength(20)
                .HasConversion<string>();
        }
    }
}
