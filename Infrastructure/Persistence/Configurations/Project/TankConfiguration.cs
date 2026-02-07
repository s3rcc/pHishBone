using Domain.Entities.Project;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Project
{
    /// <summary>
    /// Entity configuration for the Tank entity.
    /// </summary>
    public class TankConfiguration : IEntityTypeConfiguration<Tank>
    {
        public void Configure(EntityTypeBuilder<Tank> builder)
        {
            builder.ToTable("Tanks", "project");

            // PK is configured by BaseEntity

            builder.Property(t => t.UserId)
                .IsRequired()
                .HasMaxLength(50); // GUID string length

            builder.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.Width)
                .IsRequired();

            builder.Property(t => t.Height)
                .IsRequired();

            builder.Property(t => t.Depth)
                .IsRequired();

            builder.Property(t => t.WaterVolume)
                .IsRequired();

            builder.Property(t => t.WaterType)
                .IsRequired()
                .HasConversion<string>(); // Store enum as string

            builder.Property(t => t.Status)
                .IsRequired()
                .HasConversion<int>(); // Store enum as int

            builder.Property(t => t.ThumbnailUrl)
                .HasMaxLength(500);

            // Indexes for query performance
            builder.HasIndex(t => t.UserId);
            builder.HasIndex(t => t.Status);

            // Relationships (same schema)
            builder.HasMany(t => t.TankItems)
                .WithOne(ti => ti.Tank)
                .HasForeignKey(ti => ti.TankId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(t => t.TankSnapshots)
                .WithOne(ts => ts.Tank)
                .HasForeignKey(ts => ts.TankId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
