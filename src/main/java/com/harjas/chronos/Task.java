package com.harjas.chronos;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Data

public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String payload;
    private String status = "PENDING";
    private Instant runAt = Instant.now();
    private String lockedUntil;
    private int attempts = 0;
    private String lastError;

    @Column
    private int maxAttempts = 3;

    @Version
    private Integer version;
}
