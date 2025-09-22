using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IngestionApi.Migrations
{
    /// <inheritdoc />
    public partial class Add_Column_FileSize : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Size",
                table: "IngestionFiles",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Size",
                table: "IngestionFiles");
        }
    }
}
