using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the SpeciesTag junction table.
    /// Uses BaseEntity Id as PK, with unique constraint on (SpeciesId, TagId).
    /// </summary>
    public class SpeciesTagConfiguration : IEntityTypeConfiguration<SpeciesTag>
    {
        public void Configure(EntityTypeBuilder<SpeciesTag> builder)
        {
            builder.ToTable("SpeciesTags", "catalog");

            // BaseEntity handles PK configuration (uses Id)
            // Create unique index to ensure no duplicate (Species, Tag) pairs
            builder.HasIndex(st => new { st.SpeciesId, st.TagId })
                .IsUnique();

            // Relationships
            builder.HasOne(st => st.Species)
                .WithMany(s => s.SpeciesTags)
                .HasForeignKey(st => st.SpeciesId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(st => st.Tag)
                .WithMany(t => t.SpeciesTags)
                .HasForeignKey(st => st.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
