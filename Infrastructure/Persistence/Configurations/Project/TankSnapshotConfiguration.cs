using Domain.Entities.Project;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Project
{
    /// <summary>
    /// Entity configuration for the TankSnapshot entity.
    /// </summary>
    public class TankSnapshotConfiguration : IEntityTypeConfiguration<TankSnapshot>
    {
        public void Configure(EntityTypeBuilder<TankSnapshot> builder)
        {
            builder.ToTable("TankSnapshots", "project");

            // PK is configured by BaseEntity

            builder.Property(ts => ts.TankId)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(ts => ts.SafetyScore)
                .IsRequired();

            builder.Property(ts => ts.FilterCapacity)
                .IsRequired();

            // Store Warnings as JSON column
            builder.Property(ts => ts.Warnings)
                .HasColumnType("jsonb")
                .IsRequired();

            // Indexes for historical queries
            builder.HasIndex(ts => new { ts.TankId, ts.CreatedTime })
                .IsDescending(false, true); // Latest snapshots first

            // Relationship configured in TankConfiguration (cascade delete)
        }
    }
}
