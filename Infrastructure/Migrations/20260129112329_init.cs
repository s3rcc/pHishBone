using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.CreateTable(
                name: "PBUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    SupabaseUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PBUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Types",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Types", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompatibilityRules",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    SubjectTagId = table.Column<string>(type: "text", nullable: false),
                    ObjectTagId = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompatibilityRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompatibilityRules_Tags_ObjectTagId",
                        column: x => x.ObjectTagId,
                        principalSchema: "catalog",
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompatibilityRules_Tags_SubjectTagId",
                        column: x => x.SubjectTagId,
                        principalSchema: "catalog",
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Species",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    TypeId = table.Column<string>(type: "text", nullable: false),
                    ScientificName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CommonName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedBy = table.Column<string>(type: "text", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Species", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Species_Types_TypeId",
                        column: x => x.TypeId,
                        principalSchema: "catalog",
                        principalTable: "Types",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SpeciesEnvironment",
                schema: "catalog",
                columns: table => new
                {
                    SpeciesId = table.Column<string>(type: "text", nullable: false),
                    PhMin = table.Column<decimal>(type: "numeric(3,1)", nullable: false),
                    PhMax = table.Column<decimal>(type: "numeric(3,1)", nullable: false),
                    TempMin = table.Column<int>(type: "integer", nullable: false),
                    TempMax = table.Column<int>(type: "integer", nullable: false),
                    MinTankVolume = table.Column<int>(type: "integer", nullable: false),
                    WaterType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesEnvironment", x => x.SpeciesId);
                    table.ForeignKey(
                        name: "FK_SpeciesEnvironment_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalSchema: "catalog",
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpeciesProfile",
                schema: "catalog",
                columns: table => new
                {
                    SpeciesId = table.Column<string>(type: "text", nullable: false),
                    AdultSize = table.Column<decimal>(type: "numeric(4,1)", nullable: false),
                    BioLoadFactor = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    SwimLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DietType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PreferredFood = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsSchooling = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MinGroupSize = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    Origin = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesProfile", x => x.SpeciesId);
                    table.ForeignKey(
                        name: "FK_SpeciesProfile_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalSchema: "catalog",
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SpeciesTags",
                schema: "catalog",
                columns: table => new
                {
                    SpeciesId = table.Column<string>(type: "text", nullable: false),
                    TagId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpeciesTags", x => new { x.SpeciesId, x.TagId });
                    table.ForeignKey(
                        name: "FK_SpeciesTags_Species_SpeciesId",
                        column: x => x.SpeciesId,
                        principalSchema: "catalog",
                        principalTable: "Species",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SpeciesTags_Tags_TagId",
                        column: x => x.TagId,
                        principalSchema: "catalog",
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompatibilityRules_ObjectTagId",
                schema: "catalog",
                table: "CompatibilityRules",
                column: "ObjectTagId");

            migrationBuilder.CreateIndex(
                name: "IX_CompatibilityRules_SubjectTagId",
                schema: "catalog",
                table: "CompatibilityRules",
                column: "SubjectTagId");

            migrationBuilder.CreateIndex(
                name: "IX_Species_CommonName",
                schema: "catalog",
                table: "Species",
                column: "CommonName");

            migrationBuilder.CreateIndex(
                name: "IX_Species_ScientificName",
                schema: "catalog",
                table: "Species",
                column: "ScientificName");

            migrationBuilder.CreateIndex(
                name: "IX_Species_Slug",
                schema: "catalog",
                table: "Species",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Species_TypeId",
                schema: "catalog",
                table: "Species",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesTags_SpeciesId_TagId",
                schema: "catalog",
                table: "SpeciesTags",
                columns: new[] { "SpeciesId", "TagId" });

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesTags_TagId",
                schema: "catalog",
                table: "SpeciesTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Code",
                schema: "catalog",
                table: "Tags",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompatibilityRules",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "PBUsers");

            migrationBuilder.DropTable(
                name: "SpeciesEnvironment",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "SpeciesProfile",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "SpeciesTags",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "Species",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "Tags",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "Types",
                schema: "catalog");
        }
    }
}
