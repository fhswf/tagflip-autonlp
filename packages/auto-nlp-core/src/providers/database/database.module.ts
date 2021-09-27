import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { BaseConfigModule } from '../../config/base-config.module';
import { Environment } from '../../config/environment.class';
import { throwError } from '../../util/error.helper';

const databaseConfigFactory = (configService: ConfigService) => {
  const dbConfig = configService.get('mongodb');
  if (dbConfig)
    return {
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
    };
  return null;
};

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService, Environment],
      useFactory: async (
        configService: ConfigService,
        environment: Environment,
      ): Promise<MongooseModuleOptions> => {
        const dbConfig = await databaseConfigFactory(configService);
        let uri =
          environment.MONGODB_URI ||
          `mongodb://${dbConfig?.host}:${dbConfig?.port}/${dbConfig?.database}` ||
          throwError(new Error('Could not construct MongoDB URI'));
        let user = environment.MONGODB_USER || dbConfig?.username;
        let pass = environment.MONGODB_PASSWORD || dbConfig?.password;

        return {
          uri: uri,
          user: user,
          pass: pass,
          connectionFactory: (connection) => {
            return connection;
          },
          useFindAndModify: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
