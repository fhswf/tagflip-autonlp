const CONFIG_FOLDER = '';
const CONFIG_YAML = `config.${process.env.NODE_ENV || 'development'}.json`;
const configuration = () => {
  console.debug('Loading config...');

  console.debug('Loading ' + CONFIG_YAML);
  const configPath = CONFIG_FOLDER + CONFIG_YAML;
  const config = require(configPath);
  console.debug(`Configuration found: ${JSON.stringify(config, null, 2)}`);

  return config;
};

const config = configuration();

export default config;
