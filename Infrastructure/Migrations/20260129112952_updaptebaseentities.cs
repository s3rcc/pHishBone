using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updaptebaseentities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpeciesEnvironment_Species_SpeciesId",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropForeignKey(
                name: "FK_SpeciesProfile_Species_SpeciesId",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SpeciesTags",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropIndex(
                name: "IX_SpeciesTags_SpeciesId_TagId",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.RenameColumn(
                name: "SpeciesId",
                schema: "catalog",
                table: "SpeciesProfile",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "SpeciesId",
                schema: "catalog",
                table: "SpeciesEnvironment",
                newName: "Id");

            migrationBuilder.AddColumn<string>(
                name: "Id",
                schema: "catalog",
                table: "SpeciesTags",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesTags",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesTags",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesTags",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesTags",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesTags",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesTags",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesProfile",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesEnvironment",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_SpeciesTags",
                schema: "catalog",
                table: "SpeciesTags",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesTags_SpeciesId_TagId",
                schema: "catalog",
                table: "SpeciesTags",
                columns: new[] { "SpeciesId", "TagId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SpeciesEnvironment_Species_Id",
                schema: "catalog",
                table: "SpeciesEnvironment",
                column: "Id",
                principalSchema: "catalog",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SpeciesProfile_Species_Id",
                schema: "catalog",
                table: "SpeciesProfile",
                column: "Id",
                principalSchema: "catalog",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpeciesEnvironment_Species_Id",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropForeignKey(
                name: "FK_SpeciesProfile_Species_Id",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SpeciesTags",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropIndex(
                name: "IX_SpeciesTags_SpeciesId_TagId",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesTags");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesProfile");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropColumn(
                name: "CreatedTime",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropColumn(
                name: "DeletedTime",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropColumn(
                name: "LastUpdatedBy",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.DropColumn(
                name: "LastUpdatedTime",
                schema: "catalog",
                table: "SpeciesEnvironment");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "catalog",
                table: "SpeciesProfile",
                newName: "SpeciesId");

            migrationBuilder.RenameColumn(
                name: "Id",
                schema: "catalog",
                table: "SpeciesEnvironment",
                newName: "SpeciesId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SpeciesTags",
                schema: "catalog",
                table: "SpeciesTags",
                columns: new[] { "SpeciesId", "TagId" });

            migrationBuilder.CreateIndex(
                name: "IX_SpeciesTags_SpeciesId_TagId",
                schema: "catalog",
                table: "SpeciesTags",
                columns: new[] { "SpeciesId", "TagId" });

            migrationBuilder.AddForeignKey(
                name: "FK_SpeciesEnvironment_Species_SpeciesId",
                schema: "catalog",
                table: "SpeciesEnvironment",
                column: "SpeciesId",
                principalSchema: "catalog",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SpeciesProfile_Species_SpeciesId",
                schema: "catalog",
                table: "SpeciesProfile",
                column: "SpeciesId",
                principalSchema: "catalog",
                principalTable: "Species",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
