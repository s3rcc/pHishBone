using Domain.Entities.Ai;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations.Ai
{
    public class AiPromptTemplateConfiguration : IEntityTypeConfiguration<AiPromptTemplate>
    {
        public void Configure(EntityTypeBuilder<AiPromptTemplate> builder)
        {
            builder.ToTable("AiPromptTemplates", "ai");

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.SystemPrompt)
                .IsRequired()
                .HasMaxLength(8000);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.VersionLabel)
                .HasMaxLength(100);

            builder.Property(x => x.IsEnabled)
                .HasDefaultValue(true);

            builder.Property(x => x.IsActive)
                .HasDefaultValue(false);

            builder.HasIndex(x => x.Name)
                .IsUnique();

            builder.HasIndex(x => x.UseCase);
        }
    }
}
