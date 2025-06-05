using System.ComponentModel.DataAnnotations;

namespace TodoApp.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }

}
