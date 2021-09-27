import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as mongoose from 'mongoose';

const logger: Logger = new Logger('MongoEventsModule');

abstract class MongoEvent<TDocument extends mongoose.Document> {
  event: string;
  doc: TDocument;

  protected constructor(event: string, doc: TDocument) {
    logger.debug(`Firing event ${event}`);
    this.event = event;
    this.doc = doc;
  }
}

export class MongoPostSaveEvent<
  TDocument extends mongoose.Document
> extends MongoEvent<TDocument> {
  constructor(modelName: string, doc: TDocument) {
    super(modelName + '.post.save', doc);
  }
}

export class MongoPostRemoveEvent<
  TDocument extends mongoose.Document
> extends MongoEvent<TDocument> {
  constructor(modelName: string, doc: TDocument) {
    super(modelName + '.post.remove', doc);
  }
}

@Injectable()
export class MongoEvents {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public forSchema<TDocument extends mongoose.Document>(
    modelName: string,
    schema: mongoose.Schema<TDocument>,
  ) {
    const eventEmitter = this.eventEmitter;
    logger.debug(`Registering events for model '${modelName}'`);

    schema.post('save', { query: true, document: true }, async (doc) => {
      const event = new MongoPostSaveEvent(modelName, doc);
      eventEmitter.emit(event.event, event);
    });

    schema.post('remove', { query: true, document: true }, async (doc) => {
      const event = new MongoPostRemoveEvent(modelName, doc);
      eventEmitter.emit(event.event, event);
    });
    return schema;
  }
}

@Global()
@Module({
  providers: [MongoEvents],
  exports: [MongoEvents],
})
export class MongoEventsModule {}
