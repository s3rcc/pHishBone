using Domain.Entities.Catalog;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Catalog
{
    /// <summary>
    /// Entity configuration for the CompatibilityRule entity.
    /// </summary>
    public class CompatibilityRuleConfiguration : IEntityTypeConfiguration<CompatibilityRule>
    {
        public void Configure(EntityTypeBuilder<CompatibilityRule> builder)
        {
            builder.ToTable("CompatibilityRules", "catalog");

            // PK is configured by BaseEntity

            // Store enum as string for debuggability
            builder.Property(cr => cr.Severity)
                .IsRequired()
                .HasMaxLength(20)
                .HasConversion<string>();

            builder.Property(cr => cr.Message)
                .IsRequired()
                .HasColumnType("text");

            // Relationships
            builder.HasOne(cr => cr.SubjectTag)
                .WithMany(t => t.SubjectRules)
                .HasForeignKey(cr => cr.SubjectTagId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(cr => cr.ObjectTag)
                .WithMany(t => t.ObjectRules)
                .HasForeignKey(cr => cr.ObjectTagId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
