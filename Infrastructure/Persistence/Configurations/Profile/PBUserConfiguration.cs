using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Profile
{
    /// <summary>
    /// Entity configuration for the PBUser entity.
    /// </summary>
    public class PBUserConfiguration : IEntityTypeConfiguration<PBUser>
    {
        public void Configure(EntityTypeBuilder<PBUser> builder)
        {
            builder.ToTable("PBUsers", "profile");

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.FullName)
                .HasMaxLength(100);

            builder.Property(u => u.SupabaseUserId)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.Role)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20);

            // Indexes
            builder.HasIndex(u => u.SupabaseUserId)
                .IsUnique();

            builder.HasIndex(u => u.Email)
                .IsUnique();
        }
    }
}
