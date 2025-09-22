public class IngestionFile
{
    public int Id { get; set; }
    public string FileName { get; set; }
    public long Size { get; set; }
    public string StoragePath { get; set; }
    public DateTime UploadedAt { get; set; }
}