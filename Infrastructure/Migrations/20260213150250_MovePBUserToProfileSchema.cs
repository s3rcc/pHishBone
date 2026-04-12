using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MovePBUserToProfileSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "profile");

            migrationBuilder.RenameTable(
                name: "PBUsers",
                newName: "PBUsers",
                newSchema: "profile");

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                schema: "project",
                table: "Tanks",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                schema: "profile",
                table: "PBUsers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "SupabaseUserId",
                schema: "profile",
                table: "PBUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                schema: "profile",
                table: "PBUsers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                schema: "profile",
                table: "PBUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "profile",
                table: "PBUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "SpeciesImages",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    SpeciesId = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpeciesImages_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalSchema: "catalog",
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TankImages",
                schema: "project",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TankId = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Caption = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TankImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TankImages_Tanks_TankId",
                        column: x => x.TankId,
                        principalSchema: "project",
                        principalTable: "Tanks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PBUsers_Email",
                schema: "profile",
                table: "PBUsers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PBUsers_SupabaseUserId",
                schema: "profile",
                table: "PBUsers",
                column: "SupabaseUserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesImages_SpeciesId_CreatedTime",
                schema: "catalog",
                table: "SpeciesImages",
                columns: new[] { "SpeciesId", "CreatedTime" });

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesImages_SpeciesId_SortOrder",
                schema: "catalog",
                table: "SpeciesImages",
                columns: new[] { "SpeciesId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_TankImages_TankId_CreatedTime",
                schema: "project",
                table: "TankImages",
                columns: new[] { "TankId", "CreatedTime" });

            migrationBuilder.CreateIndex(
                name: "IX_TankImages_TankId_SortOrder",
                schema: "project",
                table: "TankImages",
                columns: new[] { "TankId", "SortOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpeciesImages",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "TankImages",
                schema: "project");

            migrationBuilder.DropIndex(
                name: "IX_PBUsers_Email",
                schema: "profile",
                table: "PBUsers");

            migrationBuilder.DropIndex(
                name: "IX_PBUsers_SupabaseUserId",
                schema: "profile",
                table: "PBUsers");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                schema: "project",
                table: "Tanks");

            migrationBuilder.RenameTable(
                name: "PBUsers",
                schema: "profile",
                newName: "PBUsers");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "PBUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "SupabaseUserId",
                table: "PBUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<int>(
                name: "Role",
                table: "PBUsers",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "PBUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "PBUsers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }
    }
}
