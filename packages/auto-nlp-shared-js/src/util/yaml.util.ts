import * as yaml from 'js-yaml';
import * as fs from 'fs';

export const loadYaml = (file): Record<string, any> => {
  return loadYamlString(fs.readFileSync(require.resolve(file)).toString('utf8'));
};

export const loadYamlString = (yamlString: string): Record<string, any> => {
  const yamlContent = yaml.load(yamlString);
  if (typeof yamlContent === 'string' || typeof yamlContent === 'number') {
    throw new Error('given yaml is not an object');
  }
  return yamlContent;
};
