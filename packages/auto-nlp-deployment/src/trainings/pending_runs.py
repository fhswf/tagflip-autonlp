from __future__ import annotations

import logging
import uuid
from typing import Optional

from common.redis import create_redis_client
from trainings.entities.pending_run import PendingRun
from util import Singleton

logger = logging.getLogger("uvicorn")

REDIS_KEY_PENDING_RUN_PREFIX = "auto-nlp-pending-run:"
REDIS_KEY_MESSAGE_ID_PREFIX = "auto-nlp-pending-run:message_id:"
REDIS_KEY_TRAINING_ID_PREFIX = "auto-nlp-pending-run:training_id:"

PENDING_RUN_EXPIRY_SECS = 60 * 60 * 24 * 7


class PendingRuns(Singleton):

    def _init(self, *args, **kwds):
        self._redis = create_redis_client()

    def insert_pending_run(self, message_id: str, pending_run: PendingRun, expiration_time=None):
        if not expiration_time:
            expiration_time = PENDING_RUN_EXPIRY_SECS
        intermediate_key = self._intermediate_key()
        self._redis.setex(intermediate_key, expiration_time, pending_run.json())
        self._redis.setex(PendingRuns._message_id_key(message_id), expiration_time, intermediate_key)
        self._redis.setex(PendingRuns._training_id_key(pending_run.training_id), expiration_time, intermediate_key)

    def update_active_run(self, message_id: str, pending_run: PendingRun, expiration_time=None):
        message_key = PendingRuns._message_id_key(message_id)
        if not self._redis.exists(message_key):
            raise RuntimeError("Entry does not exist.")
        intermediate_key = self._redis.get(message_key)

        if not expiration_time:
            expiration_time = PENDING_RUN_EXPIRY_SECS

        self._redis.setex(intermediate_key, expiration_time, pending_run.json())
        self._redis.setex(PendingRuns._message_id_key(message_id), expiration_time, intermediate_key)
        self._redis.setex(PendingRuns._training_id_key(pending_run.training_id), expiration_time, intermediate_key)

    def get_pending_run_by_training_id(self, training_id: str) -> Optional[PendingRun]:
        training_id_key = PendingRuns._training_id_key(training_id)
        if self._redis.exists(training_id_key):
            intermediate_key = self._redis.get(training_id_key)
            if self._redis.exists(intermediate_key):
                return PendingRun.parse_raw(self._redis.get(intermediate_key))
        return None

    def exists_pending_run_for_training_id(self, training_id: str):
        training_id_key = PendingRuns._training_id_key(training_id)
        return self._redis.exists(training_id_key)

    def get_pending_run_by_message_id(self, message_id: str) -> Optional[PendingRun]:
        message_key = PendingRuns._message_id_key(message_id)
        if self._redis.exists(message_key):
            intermediate_key = self._redis.get(message_key)
            if self._redis.exists(intermediate_key):
                return PendingRun.parse_raw(self._redis.get(intermediate_key))
        return None

    def delete_pending_run_by_message_id(self, message_id: str):
        pending_run = self.get_pending_run_by_message_id(message_id)
        if pending_run:
            message_key = PendingRuns._message_id_key(message_id)
            intermediate_key = self._redis.get(message_key)
            training_key = PendingRuns._training_id_key(pending_run.training_id)
            self._redis.delete(message_key)
            self._redis.delete(training_key)
            self._redis.delete(intermediate_key)

    @classmethod
    def _message_id_key(cls, message_id: str):
        return REDIS_KEY_MESSAGE_ID_PREFIX + message_id

    @classmethod
    def _training_id_key(cls, training_id: str):
        return REDIS_KEY_TRAINING_ID_PREFIX + training_id

    @classmethod
    def _intermediate_key(cls):
        return REDIS_KEY_PENDING_RUN_PREFIX + str(uuid.uuid4())
