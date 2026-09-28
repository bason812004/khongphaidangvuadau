package com.sportsbooking.enterprise.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RedisCacheService {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    // In-memory fallback map for zero-docker local environment
    private final Map<String, Object> inMemoryCache = new ConcurrentHashMap<>();

    public void set(String key, Object value, long timeout, TimeUnit unit) {
        inMemoryCache.put(key, value);
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, value, timeout, unit);
            } catch (Exception e) {
                log.debug("Redis unavailable, using in-memory cache for key: {}", key);
            }
        }
    }

    public Object get(String key) {
        if (redisTemplate != null) {
            try {
                Object val = redisTemplate.opsForValue().get(key);
                if (val != null) return val;
            } catch (Exception e) {
                log.debug("Redis unavailable, fetching from in-memory cache for key: {}", key);
            }
        }
        return inMemoryCache.get(key);
    }

    public void delete(String key) {
        inMemoryCache.remove(key);
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception e) {
                log.debug("Redis unavailable for delete key: {}", key);
            }
        }
    }

    public boolean hasKey(String key) {
        if (redisTemplate != null) {
            try {
                return Boolean.TRUE.equals(redisTemplate.hasKey(key));
            } catch (Exception e) {
                return inMemoryCache.containsKey(key);
            }
        }
        return inMemoryCache.containsKey(key);
    }
}
