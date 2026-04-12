using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addcloudinary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ThumbnailPublicId",
                schema: "project",
                table: "Tanks",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                schema: "project",
                table: "TankImages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                schema: "catalog",
                table: "SpeciesImages",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ThumbnailUrl",
                schema: "catalog",
                table: "Species",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailPublicId",
                schema: "catalog",
                table: "Species",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ThumbnailPublicId",
                schema: "project",
                table: "Tanks");

            migrationBuilder.DropColumn(
                name: "PublicId",
                schema: "project",
                table: "TankImages");

            migrationBuilder.DropColumn(
                name: "PublicId",
                schema: "catalog",
                table: "SpeciesImages");

            migrationBuilder.DropColumn(
                name: "ThumbnailPublicId",
                schema: "catalog",
                table: "Species");

            migrationBuilder.AlterColumn<string>(
                name: "ThumbnailUrl",
                schema: "catalog",
                table: "Species",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);
        }
    }
}
