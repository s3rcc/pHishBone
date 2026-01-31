using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class addtankmanagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "project");

            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "PBUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Tanks",
                schema: "project",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Height = table.Column<int>(type: "integer", nullable: false),
                    Depth = table.Column<int>(type: "integer", nullable: false),
                    WaterVolume = table.Column<int>(type: "integer", nullable: false),
                    WaterType = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tanks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TankItems",
                schema: "project",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TankId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ItemType = table.Column<int>(type: "integer", nullable: false),
                    ReferenceId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    Note = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TankItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TankItems_Tanks_TankId",
                        column: x => x.TankId,
                        principalSchema: "project",
                        principalTable: "Tanks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TankSnapshots",
                schema: "project",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TankId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SafetyScore = table.Column<int>(type: "integer", nullable: false),
                    FilterCapacity = table.Column<int>(type: "integer", nullable: false),
                    Warnings = table.Column<List<string>>(type: "jsonb", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TankSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TankSnapshots_Tanks_TankId",
                        column: x => x.TankId,
                        principalSchema: "project",
                        principalTable: "Tanks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TankItems_ReferenceId",
                schema: "project",
                table: "TankItems",
                column: "ReferenceId");

            migrationBuilder.CreateIndex(
                name: "IX_TankItems_TankId_ItemType",
                schema: "project",
                table: "TankItems",
                columns: new[] { "TankId", "ItemType" });

            migrationBuilder.CreateIndex(
                name: "IX_Tanks_Status",
                schema: "project",
                table: "Tanks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tanks_UserId",
                schema: "project",
                table: "Tanks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TankSnapshots_TankId_CreatedTime",
                schema: "project",
                table: "TankSnapshots",
                columns: new[] { "TankId", "CreatedTime" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TankItems",
                schema: "project");

            migrationBuilder.DropTable(
                name: "TankSnapshots",
                schema: "project");

            migrationBuilder.DropTable(
                name: "Tanks",
                schema: "project");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "PBUsers");
        }
    }
}
