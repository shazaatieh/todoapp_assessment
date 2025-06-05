namespace TodoApp.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string Estimate { get; set; } = string.Empty;
        public string Importance { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }

}
