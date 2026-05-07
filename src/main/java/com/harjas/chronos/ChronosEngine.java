package com.harjas.chronos;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@EnableScheduling
public class ChronosEngine {

    private final TaskRepository taskRepository;
    private final LeaderService leaderService;

    public ChronosEngine(TaskRepository taskRepository, LeaderService leaderService) {
        this.leaderService = leaderService;
        this.taskRepository = taskRepository;
    }

    @Scheduled(fixedDelay = 5000)
    public void pollAndExecute() {
        if (leaderService.isLeader()) {
            System.out.println("Node [" + leaderService.getNodeId() + "] is LEADER. Checking for tasks...");

            List<Task> tasks = taskRepository.claimTasks(leaderService.getNodeId(), 5);

            if (tasks.isEmpty()) {
                System.out.println("No tasks found");
            } else {
                for (Task task : tasks) {
                    processTask(task);
                }
            }
        } else {
            System.out.println("Node [" + leaderService.getNodeId() + "] is a follower. Waiting...");
        }
    }

    public void processTask(Task task) {
        try {
            System.out.println("Execuing task" + task.getId());

            if (task.getPayload().contains("fail")) {
                throw new RuntimeException("Simulated processing error!!");
            }
            task.setStatus("COMPLETED");
            task.setLastError(null);
            System.out.println("Task " + task.getId() + " Finished!");

        } catch (Exception e) {
            int currentAttempts = task.getAttempts() + 1;
            task.setAttempts(currentAttempts);
            task.setLastError(e.getMessage());

            if (currentAttempts >= task.getMaxAttempts()) {
                task.setStatus("FAILED");
                System.err.println(
                        "Task " + task.getId() + " PERMANENTLY FAILED after " + currentAttempts + " attempts.");
            } else {
                task.setStatus("PENDING");

                long backOffSeconds = (long) Math.pow(2, currentAttempts) * 15;
                task.setRunAt(java.time.Instant.now().plusSeconds(backOffSeconds));
                System.err.println("Task " + task.getId() + " failed. Retrying in " + backOffSeconds + "s");
            }
        } finally {
            taskRepository.save(task);
        }
    }

    @Scheduled(fixedDelay = 60000)
    public void cleanUpStaleTasks() {

        if (leaderService.isLeader()) {
            System.out.println("Janitor: Looking for stale/timed-out tasks...");
        }
    }
}
