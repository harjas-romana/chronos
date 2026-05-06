package com.harjas.chronos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    @Query(value = """
            UPDATE tasks
            SET status = 'RUNNING',
                locked_by = :workerId,
                locked_until = NOW() + INTERVAL '5 minutes'
            WHERE id IN (
                SELECT id FROM tasks
                WHERE status = 'PENDING' AND run_at <= NOW()
                ORDER BY run_at ASC
                LIMIT :batchSize
                FOR UPDATE SKIP LOCKED
            )
            RETURNING *
            """, nativeQuery = true)
    List<Task> claimTasks(@Param("workerId") String workerId, @Param("batchSize") int batchSize);
}
