using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Profile
{
    /// <summary>
    /// Entity configuration for the user's bookmarked species collection.
    /// </summary>
    public class SpeciesBookmarkConfiguration : IEntityTypeConfiguration<SpeciesBookmark>
    {
        public void Configure(EntityTypeBuilder<SpeciesBookmark> builder)
        {
            builder.ToTable("SpeciesBookmarks", "profile");

            builder.Property(bookmark => bookmark.UserId)
                .IsRequired()
                .HasMaxLength(32);

            builder.Property(bookmark => bookmark.SpeciesId)
                .IsRequired()
                .HasMaxLength(32);

            builder.HasIndex(bookmark => new { bookmark.UserId, bookmark.SpeciesId })
                .IsUnique();

            builder.HasIndex(bookmark => new { bookmark.UserId, bookmark.CreatedTime });

            builder.HasOne(bookmark => bookmark.User)
                .WithMany(user => user.SpeciesBookmarks)
                .HasForeignKey(bookmark => bookmark.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(bookmark => bookmark.Species)
                .WithMany(species => species.SpeciesBookmarks)
                .HasForeignKey(bookmark => bookmark.SpeciesId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
