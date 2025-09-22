using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IngestionApi.Migrations
{
    /// <inheritdoc />
    public partial class Update_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "IngestionMetadata",
                newName: "Tags");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Tags",
                table: "IngestionMetadata",
                newName: "Description");
        }
    }
}
