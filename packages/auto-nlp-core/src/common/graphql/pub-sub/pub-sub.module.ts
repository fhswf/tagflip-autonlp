import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PubSub } from 'apollo-server-express';

export const PUB_SUB = 'PUB_SUB';
const pubSub = new PubSub();

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubSub,
      // useFactory: (configService: ConfigService) => pubSub,
      // inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
