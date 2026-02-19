using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the Species entity.
    /// </summary>
    public class SpeciesConfiguration : IEntityTypeConfiguration<Species>
    {
        public void Configure(EntityTypeBuilder<Species> builder)
        {
            builder.ToTable("Species", "catalog");

            // PK is configured by BaseEntity

            builder.Property(s => s.ScientificName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.CommonName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.ThumbnailUrl)
                .HasMaxLength(500);

            builder.Property(s => s.ThumbnailPublicId)
                .HasMaxLength(255);

            builder.Property(s => s.Slug)
                .IsRequired()
                .HasMaxLength(100);

            // Indexes
            builder.HasIndex(s => s.Slug)
                .IsUnique();

            builder.HasIndex(s => s.ScientificName);

            builder.HasIndex(s => s.CommonName);

            // Relationships
            builder.HasOne(s => s.Type)
                .WithMany(t => t.Species)
                .HasForeignKey(s => s.TypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // 1:1 with SpeciesEnvironment (Species is Principal)
            builder.HasOne(s => s.SpeciesEnvironment)
                .WithOne(se => se.Species)
                .HasForeignKey<SpeciesEnvironment>(se => se.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // 1:1 with SpeciesProfile (Species is Principal)
            builder.HasOne(s => s.SpeciesProfile)
                .WithOne(sp => sp.Species)
                .HasForeignKey<SpeciesProfile>(sp => sp.Id)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
