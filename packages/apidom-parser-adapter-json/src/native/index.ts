import { ParseResultElement, refract } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> => {
  if (source.trim().length === 0) {
    return false;
  }

  try {
    JSON.parse(source);
    return true;
  } catch {
    return false;
  }
};

/**
 * @public
 */
export const parse = async (source: string): Promise<ParseResultElement> => {
  const parseResult = new ParseResultElement();

  if (source.trim().length === 0) {
    return parseResult;
  }

  let pojo: unknown = JSON.parse(source);
  const element = refract(pojo);
  pojo = null; // allow GC to reclaim POJO
  element.classes.push('result');
  parseResult.push(element);

  return parseResult;
};
