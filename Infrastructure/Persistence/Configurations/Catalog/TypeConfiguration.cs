using Domain.Entities.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CatalogType = Domain.Entities.Catalog.Type;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the Type entity.
    /// </summary>
    public class TypeConfiguration : IEntityTypeConfiguration<CatalogType>
    {
        public void Configure(EntityTypeBuilder<CatalogType> builder)
        {
            builder.ToTable("Types", "catalog");

            // PK is configured by BaseEntity

            builder.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(t => t.Description)
                .HasMaxLength(255);

            // Relationships
            builder.HasMany(t => t.Species)
                .WithOne(s => s.Type)
                .HasForeignKey(s => s.TypeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
