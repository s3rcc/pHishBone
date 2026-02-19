using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the SpeciesImage entity.
    /// </summary>
    public class SpeciesImageConfiguration : IEntityTypeConfiguration<SpeciesImage>
    {
        public void Configure(EntityTypeBuilder<SpeciesImage> builder)
        {
            builder.ToTable("SpeciesImages", "catalog");

            builder.Property(si => si.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(si => si.PublicId)
                .HasMaxLength(255);

            builder.Property(si => si.Caption)
                .HasMaxLength(255);

            builder.Property(si => si.SortOrder)
                .HasDefaultValue(0);

            // Indexes for ordering
            builder.HasIndex(si => new { si.SpeciesId, si.SortOrder });
            builder.HasIndex(si => new { si.SpeciesId, si.CreatedTime });

            // Relationship: Species (1) -> SpeciesImages (many)
            builder.HasOne(si => si.Species)
                .WithMany(s => s.SpeciesImages)
                .HasForeignKey(si => si.SpeciesId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
