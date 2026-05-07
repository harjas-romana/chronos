package com.harjas.chronos;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.UUID;

@Service
public class LeaderService {
    private final StringRedisTemplate redisTemplate;
    private final String nodeId = UUID.randomUUID().toString();
    private static final String LOCK_KEY = "chronos:leader:lock";

    public LeaderService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isLeader() {
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, nodeId, Duration.ofSeconds(10));

        if (Boolean.TRUE.equals(acquired)) {
            return true;
        }

        String currentLeader = redisTemplate.opsForValue().get(LOCK_KEY);

        if (nodeId.equals(currentLeader)) {
            redisTemplate.expire(LOCK_KEY, Duration.ofSeconds(10));
            return true;
        }
        return false;
    }

    public String getNodeId() {
        return nodeId;
    }
}
