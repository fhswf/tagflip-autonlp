import * as fs from 'fs';
import * as yaml from 'js-yaml';

export const loadYaml = (
  file,
  encoding: BufferEncoding = 'utf8',
): Record<string, any> => {
  const yamlContent = yaml.load(fs.readFileSync(file, encoding));
  if (typeof yamlContent === 'string' || typeof yamlContent === 'number') {
    throw new Error('given yaml is not an object');
  }
  return yamlContent;
};
