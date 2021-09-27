import { PendingRun as IPendingRun } from 'auto-nlp-shared-js';
import { Expose } from 'class-transformer';

export class PendingRun implements IPendingRun {
  @Expose({ name: 'message_id' })
  messageId: string;
}
