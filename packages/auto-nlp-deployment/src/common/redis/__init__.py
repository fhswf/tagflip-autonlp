import os
import redis


def create_redis_client() -> redis.Redis:
    return redis.Redis(host=os.getenv("REDIS_HOST", "localhost"),
                       port=os.getenv("REDIS_PORT", 6379),
                       username=os.getenv("REDIS_USER", None),
                       password=os.getenv("REDIS_PASSWORD", None))
