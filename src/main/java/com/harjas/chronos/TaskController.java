package com.harjas.chronos;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = { "http://localhost:5173", "https://chronos-zst4.onrender.com" })
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        // Return tasks ordered by most recent
        return taskRepository.findAll();
    }

    @GetMapping("/ping")
    public String ping() {
        return "Chronos is awake!";
    }

    @PostMapping
    public Task createTask(@RequestBody Map<String, String> request) {
        Task task = new Task();
        task.setPayload(request.get("payload"));
        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable UUID id) {
        taskRepository.deleteById(id);
    }
}