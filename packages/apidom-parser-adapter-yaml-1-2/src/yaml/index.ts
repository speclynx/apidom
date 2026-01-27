import { parseDocument } from 'yaml';
import { ParseResultElement, AnnotationElement, refract } from '@speclynx/apidom-datamodel';

/**
 * @public
 */
export const detect = async (source: string): Promise<boolean> => {
  if (source.trim().length === 0) {
    return false;
  }

  try {
    const document = parseDocument(source, { version: '1.2' });
    // Filter out MULTIPLE_DOCS errors (handled as warning in parse)
    return document.errors.filter((e) => e.code !== 'MULTIPLE_DOCS').length === 0;
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

  const document = parseDocument(source, { version: '1.2' });

  // Handle document errors
  for (const error of document.errors) {
    if (error.code === 'MULTIPLE_DOCS') {
      // Multiple documents warning (align with tree-sitter behavior)
      const message =
        'Only first document within YAML stream will be used. Rest will be discarded.';
      const annotation = new AnnotationElement(message);
      annotation.classes.push('warning');
      parseResult.push(annotation);
    } else {
      // Fatal error - throw
      throw error;
    }
  }

  const element = refract(document.toJS());
  element.classes.push('result');
  parseResult.push(element);

  return parseResult;
};
