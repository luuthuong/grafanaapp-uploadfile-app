public class IngestionMetadata
{
    public int Id { get; set; }
    public int IngestionFileId { get; set; }
    public string Tags { get; set; }
    public string Status { get; set; }
    public DateTime SubmittedAt { get; set; }

    public IngestionFile IngestionFile { get; set; }
}