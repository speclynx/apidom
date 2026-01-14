import { parse as parseYaml } from 'yaml';
import { ParseResultElement, refract } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> => {
  try {
    parseYaml(source);
    return true;
  } catch {
    return false;
  }
};

/**
 * @public
 */
export const parse = async (source: string): Promise<ParseResultElement> => {
  const pojo = parseYaml(source);
  const element = refract(pojo);
  const parseResult = new ParseResultElement();
  element.classes.push('result');
  parseResult.push(element);
  return parseResult;
};
