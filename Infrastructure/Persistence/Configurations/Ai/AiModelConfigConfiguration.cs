using Domain.Entities.Ai;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Ai
{
    public class AiModelConfigConfiguration : IEntityTypeConfiguration<AiModelConfig>
    {
        public void Configure(EntityTypeBuilder<AiModelConfig> builder)
        {
            builder.ToTable("AiModelConfigs", "ai");

            builder.Property(x => x.DisplayName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.Provider)
                .IsRequired();

            builder.Property(x => x.ProviderModelId)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.IsEnabled)
                .HasDefaultValue(true);

            builder.Property(x => x.TimeoutSeconds)
                .HasDefaultValue(60);

            builder.Property(x => x.Temperature)
                .HasPrecision(3, 2);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.HasIndex(x => x.DisplayName)
                .HasFilter("\"DeletedTime\" IS NULL")
                .IsUnique();

            builder.HasIndex(x => new { x.Provider, x.ProviderModelId })
                .HasFilter("\"DeletedTime\" IS NULL")
                .IsUnique();
        }
    }
}
