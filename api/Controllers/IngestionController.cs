using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("ingestion")]
public class IngestionController : ControllerBase
{
    private readonly IngestionDbContext _dbContext;
    private readonly IWebHostEnvironment _env;

    public IngestionController(IngestionDbContext dbContext, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _env = env;
    }

    public class UploadWithMetadataRequest
    {
        [FromForm]
        public IFormFile File { get; set; }
        [FromForm]
        public string Tags { get; set; }

        [FromForm] public string? FileName { get; set; } = string.Empty;
    }

    [HttpPost("upload-with-metadata")]
    public async Task<IActionResult> UploadWithMetadata([FromForm] UploadWithMetadataRequest request)
    {
        var file = request.File;
        var tags = request.Tags;

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "UploadedFiles");
        Directory.CreateDirectory(uploadsFolder);

        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var filePath = Path.Combine(uploadsFolder, timestamp + "_" + (string.IsNullOrWhiteSpace(request.FileName) ? request.FileName : file.FileName));

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var ingestionFile = new IngestionFile
        {
            FileName = file.FileName,
            StoragePath = filePath,
            Size = (int)file.Length,
            UploadedAt = DateTime.UtcNow
        };

        _dbContext.IngestionFiles.Add(ingestionFile);
        await _dbContext.SaveChangesAsync();

        var ingestionMetadata = new IngestionMetadata
        {
            IngestionFileId = ingestionFile.Id,
            Tags = tags,
            Status = "Submitted",
            SubmittedAt = DateTime.UtcNow
        };

        _dbContext.IngestionMetadata.Add(ingestionMetadata);
        await _dbContext.SaveChangesAsync();

        return Ok(new
        {
            fileId = ingestionFile.Id,
            metadataId = ingestionMetadata.Id,
            message = "File and metadata uploaded successfully"
        });
    }

    // Endpoint: /ingestion/status (check processing)
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus([FromQuery] int id)
    {
        var metadata = await _dbContext.IngestionMetadata
            .Include(m => m.IngestionFile)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (metadata == null)
            return NotFound(new { message = "Metadata not found" });

        return Ok(new
        {
            id = metadata.Id,
            fileName = metadata.IngestionFile.FileName,
            status = metadata.Status
        });
    }

    // Endpoint: /ingestion/file/{id} (download file by id)
    [HttpGet("file/{id:int}")]
    public async Task<IActionResult> GetFile([FromRoute] int id)
    {
        var fileRecord = await _dbContext.IngestionFiles.FirstOrDefaultAsync(f => f.Id == id);
        if (fileRecord == null || !System.IO.File.Exists(fileRecord.StoragePath))
            return NotFound(new { message = "File not found" });

        var fileStream = new FileStream(fileRecord.StoragePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var contentType = "application/octet-stream";
        return File(fileStream, contentType, fileRecord.FileName);
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetList([FromQuery] string? fileName, [FromQuery] string? status)
    {
        var query = _dbContext.IngestionMetadata
            .Include(m => m.IngestionFile)
            .AsQueryable();

        if (!string.IsNullOrEmpty(fileName))
            query = query.Where(m => m.IngestionFile.FileName.Contains(fileName));

        if (!string.IsNullOrEmpty(status))
            query = query.Where(m => m.Status == status);

        var result = await query
            .OrderByDescending(m => m.SubmittedAt)
            .Select(m => new
            {
                m.Id,
                m.Tags,
                m.Status,
                m.SubmittedAt,
                File = new
                {
                    m.IngestionFile.Id,
                    m.IngestionFile.FileName,
                    m.IngestionFile.UploadedAt,
                    m.IngestionFile.Size
                }
            })
            .ToListAsync();

        return Ok(result);
    }
}

public class MetadataDto
{
    public string FileName { get; set; }
    public string Description { get; set; }
    // Add other metadata fields as needed
}