using Domain.Entities.Project;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Project
{
    /// <summary>
    /// Entity configuration for the TankImage entity.
    /// </summary>
    public class TankImageConfiguration : IEntityTypeConfiguration<TankImage>
    {
        public void Configure(EntityTypeBuilder<TankImage> builder)
        {
            builder.ToTable("TankImages", "project");

            builder.Property(ti => ti.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(ti => ti.PublicId)
                .HasMaxLength(255);

            builder.Property(ti => ti.Caption)
                .HasMaxLength(255);

            builder.Property(ti => ti.SortOrder)
                .HasDefaultValue(0);

            // Indexes for ordering
            builder.HasIndex(ti => new { ti.TankId, ti.SortOrder });
            builder.HasIndex(ti => new { ti.TankId, ti.CreatedTime });

            // Relationship: Tank (1) -> TankImages (many)
            builder.HasOne(ti => ti.Tank)
                .WithMany(t => t.TankImages)
                .HasForeignKey(ti => ti.TankId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
