import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { loadYaml } from '../util/helper/yaml.helper';
import * as appRoot from 'app-root-path';
import { Environment } from './environment.class';
import { transformAndValidateSync } from 'class-transformer-validator';

const logger = new Logger(path.basename(__filename));

const CONFIG_FOLDER = './config';
const CONFIG_YAML = `config.${process.env.NODE_ENV || 'development'}.yaml`;
const configuration = (): Record<string, any> => {
  logger.log('Loading config...');
  const config_folder = path.join(appRoot.toString(), CONFIG_FOLDER);

  logger.debug('Loading ' + CONFIG_YAML);
  const config = loadYaml(path.join(config_folder, CONFIG_YAML));
  logger.debug(`Configuration found: ${JSON.stringify(config, null, 2)}`);

  return config;
};

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  providers: [
    {
      provide: Environment,
      useValue: transformAndValidateSync(Environment, process.env),
    },
  ],
  exports: [Environment],
})
export class BaseConfigModule {}
