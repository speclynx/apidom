import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';
import { JSONReferenceElement, MediaElement } from '@speclynx/apidom-ns-json-schema-draft-4';

import JSONSchemaElement from '../elements/JSONSchema.ts';
import LinkDescriptionElement from '../elements/LinkDescription.ts';
import specification from './specification.ts';

/**
 * @public
 */
export interface FixedField {
  name: string;
  alias?: string;
  $visitor: unknown;
}

interface ResolvedSpec extends ResolvedSpecification {
  visitors: {
    document: {
      objects: Record<string, { fixedFields: Record<string, unknown> }>;
    };
  };
}

// Resolve specification to dereference $ref pointers
const resolvedSpec = resolveSpecification<ResolvedSpec>(specification);

// Extract fixed fields as list of { name, alias?, $visitor }
const getFixedFields = (fixedFieldsSpec: Record<string, unknown>): FixedField[] => {
  return Object.entries(fixedFieldsSpec).map(([name, fieldSpec]) => {
    if (isPlainObject(fieldSpec)) {
      return { name, ...fieldSpec } as FixedField;
    }
    return { name, $visitor: fieldSpec };
  });
};

// Define lazy getters for fixedFields on element classes
// Note: JSONReferenceElement and MediaElement inherit fixedFields from draft-4
Object.defineProperty(JSONSchemaElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.JSONSchema.fixedFields),
  enumerable: true,
});

Object.defineProperty(LinkDescriptionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.LinkDescription.fixedFields),
  enumerable: true,
});

export { JSONSchemaElement, JSONReferenceElement, MediaElement, LinkDescriptionElement };
