using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Data;
using TodoApp.DTOs;
using TodoApp.Models;

namespace TodoApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserTasks(int userId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var task = new TaskItem
            {
                UserId = dto.UserId,
                Title = dto.Title,
                Category = dto.Category,
                Estimate = dto.Estimate,
                Importance = dto.Importance,
                DueDate = dto.DueDate,
                Status = dto.Status
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var result = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Category = task.Category,
                Estimate = task.Estimate,
                Importance = task.Importance,
                DueDate = task.DueDate,
                Status = task.Status
            };

            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Title = dto.Title;
            task.Category = dto.Category;
            task.Estimate = dto.Estimate;
            task.Importance = dto.Importance;
            task.DueDate = dto.DueDate;
            task.Status = dto.Status;

            await _context.SaveChangesAsync();

            var result = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Category = task.Category,
                Estimate = task.Estimate,
                Importance = task.Importance,
                DueDate = task.DueDate,
                Status = task.Status
            };

            return Ok(result);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
