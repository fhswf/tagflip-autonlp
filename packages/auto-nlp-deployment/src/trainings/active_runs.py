from __future__ import annotations

import uuid
from typing import Optional

from common.redis import create_redis_client
from util import Singleton
from .entities.active_run import ActiveRun

REDIS_KEY_ACTIVE_RUN_PREFIX = "auto-nlp-active-run:"
REDIS_KEY_MESSAGE_ID_PREFIX = "auto-nlp-active-run:message_id:"
REDIS_KEY_RUN_ID_PREFIX = "auto-nlp-active-run:run_id:"
REDIS_ACTIVE_RUN_EXPIRY_SECS = 60 * 60 * 24 * 60


class ActiveRuns(Singleton):

    def _init(self, *args, **kwds):
        self._redis = create_redis_client()

    def insert_active_run(self, message_id: str, active_run: ActiveRun, expiration_time=None):
        if not expiration_time:
            expiration_time = REDIS_ACTIVE_RUN_EXPIRY_SECS
        intermediate_key = self._intermediate_key()
        self._redis.setex(intermediate_key, expiration_time, active_run.json())
        self._redis.setex(ActiveRuns._message_id_key(message_id), expiration_time, intermediate_key)
        self._redis.setex(ActiveRuns._run_id_key(active_run.run_id), expiration_time, intermediate_key)

    def update_active_run(self, message_id: str, active_run: ActiveRun, expiration_time=None):
        message_key = ActiveRuns._message_id_key(message_id)
        if self._redis.exists(message_key):
            intermediate_key = self._redis.get(message_key)
            if not expiration_time:
                expiration_time = REDIS_ACTIVE_RUN_EXPIRY_SECS

            self._redis.setex(intermediate_key, expiration_time, active_run.json())
            self._redis.setex(ActiveRuns._message_id_key(message_id), expiration_time, intermediate_key)
            self._redis.setex(ActiveRuns._run_id_key(active_run.run_id), expiration_time, intermediate_key)

    def get_active_run_by_run_id(self, run_id: str) -> Optional[ActiveRun]:
        run_key = ActiveRuns._run_id_key(run_id)
        if self._redis.exists(run_key):
            intermediate_key = self._redis.get(run_key)
            if self._redis.exists(intermediate_key):
                return ActiveRun.parse_raw(self._redis.get(intermediate_key))
        return None

    def get_active_run_by_message_id(self, message_id: str) -> Optional[ActiveRun]:
        message_key = ActiveRuns._message_id_key(message_id)
        if self._redis.exists(message_key):
            intermediate_key = self._redis.get(message_key)
            if self._redis.exists(intermediate_key):
                return ActiveRun.parse_raw(self._redis.get(intermediate_key))
        return None

    def delete_active_run_by_message_id(self, message_id: str):
        active_run = self.get_active_run_by_message_id(message_id)
        if active_run:
            message_key = ActiveRuns._message_id_key(message_id)
            intermediate_key = self._redis.get(message_key)
            run_key = ActiveRuns._run_id_key(active_run.run_id)
            self._redis.delete(message_key)
            self._redis.delete(run_key)
            self._redis.delete(intermediate_key)

    @classmethod
    def _message_id_key(cls, message_id: str):
        return REDIS_KEY_MESSAGE_ID_PREFIX + message_id

    @classmethod
    def _run_id_key(cls, run_id: str):
        return REDIS_KEY_RUN_ID_PREFIX + run_id

    @classmethod
    def _intermediate_key(cls):
        return REDIS_KEY_ACTIVE_RUN_PREFIX + str(uuid.uuid4())
