import * as yaml from 'js-yaml';

export const loadYaml = (file): Record<string, any> => {
  return loadYamlString(require(file));
};

export const loadYamlString = (yamlString: string): Record<string, any> => {
  const yamlContent = yaml.load(yamlString);
  if (typeof yamlContent === 'string' || typeof yamlContent === 'number') {
    throw new Error('given yaml is not an object');
  }
  return yamlContent;
};
