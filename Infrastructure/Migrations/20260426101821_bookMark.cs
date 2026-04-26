using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class bookMark : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SpeciesBookmarks",
                schema: "profile",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SpeciesId = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesBookmarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SpeciesBookmarks_PBUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "profile",
                        principalTable: "PBUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpeciesBookmarks_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalSchema: "catalog",
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesBookmarks_SpeciesId",
                schema: "profile",
                table: "SpeciesBookmarks",
                column: "SpeciesId");

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesBookmarks_UserId_CreatedTime",
                schema: "profile",
                table: "SpeciesBookmarks",
                columns: new[] { "UserId", "CreatedTime" });

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesBookmarks_UserId_SpeciesId",
                schema: "profile",
                table: "SpeciesBookmarks",
                columns: new[] { "UserId", "SpeciesId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpeciesBookmarks",
                schema: "profile");
        }
    }
}
