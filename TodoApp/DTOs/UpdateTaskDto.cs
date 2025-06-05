namespace TodoApp.DTOs
{
    public class UpdateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Estimate { get; set; } = string.Empty;
        public string Importance { get; set; } = "LOW";
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "To do";
    }
}