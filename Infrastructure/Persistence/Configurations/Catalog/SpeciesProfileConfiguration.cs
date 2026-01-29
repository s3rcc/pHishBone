using Domain.Entities.Catalog;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the SpeciesProfile entity.
    /// Configured as dependent in 1:1 relationship with Species.
    /// Uses Id from BaseEntity as shared PK/FK with Species.
    /// </summary>
    public class SpeciesProfileConfiguration : IEntityTypeConfiguration<SpeciesProfile>
    {
        public void Configure(EntityTypeBuilder<SpeciesProfile> builder)
        {
            builder.ToTable("SpeciesProfile", "catalog");

            // BaseEntity handles PK configuration
            // Id serves as both PK and FK to Species (shared PK/FK pattern)

            builder.Property(sp => sp.AdultSize)
                .IsRequired()
                .HasColumnType("decimal(4,1)");

            builder.Property(sp => sp.BioLoadFactor)
                .IsRequired()
                .HasColumnType("decimal(3,2)");

            // Store enums as strings for debuggability
            builder.Property(sp => sp.SwimLevel)
                .IsRequired()
                .HasMaxLength(20)
                .HasConversion<string>();

            builder.Property(sp => sp.DietType)
                .IsRequired()
                .HasMaxLength(20)
                .HasConversion<string>();

            builder.Property(sp => sp.PreferredFood)
                .HasMaxLength(255);

            builder.Property(sp => sp.IsSchooling)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(sp => sp.MinGroupSize)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(sp => sp.Origin)
                .HasMaxLength(100);

            builder.Property(sp => sp.Description)
                .HasColumnType("text");
        }
    }
}
