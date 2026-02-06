import { ParseResultElement } from '@speclynx/apidom-datamodel';

import { parseSourceDescriptions as parseSourceDescriptionsBase } from '../arazzo-json-1/source-descriptions.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

/**
 * @public
 */
export const parseSourceDescriptions = (
  parseResult: ParseResultElement,
  parseResultRetrievalURI: string,
  options: ReferenceOptions,
  parserName: string = 'arazzo-yaml-1',
): Promise<ParseResultElement[]> => {
  return parseSourceDescriptionsBase(parseResult, parseResultRetrievalURI, options, parserName);
};
