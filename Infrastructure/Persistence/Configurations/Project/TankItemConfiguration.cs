using Domain.Entities.Project;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Project
{
    /// <summary>
    /// Entity configuration for the TankItem entity.
    /// </summary>
    public class TankItemConfiguration : IEntityTypeConfiguration<TankItem>
    {
        public void Configure(EntityTypeBuilder<TankItem> builder)
        {
            builder.ToTable("TankItems", "project");

            // PK is configured by BaseEntity

            builder.Property(ti => ti.TankId)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(ti => ti.ItemType)
                .IsRequired()
                .HasConversion<int>(); // Store enum as int

            builder.Property(ti => ti.ReferenceId)
                .IsRequired()
                .HasMaxLength(50); // Cross-schema reference (string GUID)

            builder.Property(ti => ti.Quantity)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(ti => ti.Note)
                .HasMaxLength(255);

            // Composite index for efficient queries
            builder.HasIndex(ti => new { ti.TankId, ti.ItemType });
            builder.HasIndex(ti => ti.ReferenceId);

            // Relationship configured in TankConfiguration (cascade delete)
        }
    }
}
