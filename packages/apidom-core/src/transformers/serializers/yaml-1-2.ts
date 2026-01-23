import {
  Document,
  stringify,
  type CreateNodeOptions,
  type DocumentOptions,
  type SchemaOptions,
  type ToStringOptions,
} from 'yaml';
import { Element } from '@speclynx/apidom-datamodel';

import toValue from './value.ts';

/**
 * @public
 */
export interface YamlSerializerOptions
  extends
    DocumentOptions,
    Pick<CreateNodeOptions, 'aliasDuplicateObjects'>,
    Pick<SchemaOptions, 'sortMapEntries'>,
    ToStringOptions {
  /** Include %YAML directive and document marker */
  directive?: boolean;
}

/**
 * @public
 */
const serializer = (
  element: Element,
  { directive = false, aliasDuplicateObjects = false, ...options }: YamlSerializerOptions = {},
): string => {
  const allOptions = { aliasDuplicateObjects, ...options };

  if (directive) {
    const doc = new Document(toValue(element), allOptions);
    doc.directives!.yaml.explicit = true;
    return doc.toString(options);
  }
  return stringify(toValue(element), allOptions);
};

export default serializer;
