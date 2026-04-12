using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFtsVectorColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE catalog.""Species""
                ADD COLUMN ""FtsVector"" tsvector
                GENERATED ALWAYS AS (
                    to_tsvector(
                        'simple',
                        coalesce(""CommonName"", '') || ' ' || coalesce(""ScientificName"", '')
                    )
                ) STORED;
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX ""IX_Species_FtsVector""
                ON catalog.""Species""
                USING GIN (""FtsVector"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP INDEX IF EXISTS catalog.""IX_Species_FtsVector"";");
            migrationBuilder.Sql(@"ALTER TABLE catalog.""Species"" DROP COLUMN IF EXISTS ""FtsVector"";");
        }
    }
}
