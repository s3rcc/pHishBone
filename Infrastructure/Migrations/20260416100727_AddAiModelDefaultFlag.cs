using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiModelDefaultFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AiModelConfigs_DisplayName",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.DropIndex(
                name: "IX_AiModelConfigs_Provider_ProviderModelId",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                schema: "ai",
                table: "AiModelConfigs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_AiModelConfigs_DisplayName",
                schema: "ai",
                table: "AiModelConfigs",
                column: "DisplayName",
                unique: true,
                filter: "\"DeletedTime\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AiModelConfigs_IsDefault",
                schema: "ai",
                table: "AiModelConfigs",
                column: "IsDefault",
                unique: true,
                filter: "\"DeletedTime\" IS NULL AND \"IsDefault\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_AiModelConfigs_Provider_ProviderModelId",
                schema: "ai",
                table: "AiModelConfigs",
                columns: new[] { "Provider", "ProviderModelId" },
                unique: true,
                filter: "\"DeletedTime\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AiModelConfigs_DisplayName",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.DropIndex(
                name: "IX_AiModelConfigs_IsDefault",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.DropIndex(
                name: "IX_AiModelConfigs_Provider_ProviderModelId",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                schema: "ai",
                table: "AiModelConfigs");

            migrationBuilder.CreateIndex(
                name: "IX_AiModelConfigs_DisplayName",
                schema: "ai",
                table: "AiModelConfigs",
                column: "DisplayName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiModelConfigs_Provider_ProviderModelId",
                schema: "ai",
                table: "AiModelConfigs",
                columns: new[] { "Provider", "ProviderModelId" },
                unique: true);
        }
    }
}
