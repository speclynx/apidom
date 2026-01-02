import { pipe, assocPath, dissocPath } from 'ramda';
import { specificationObj } from '@speclynx/apidom-ns-json-schema-draft-4';

import JSONSchemaVisitor from './visitors/json-schema/index.ts';
import JSONSchemaItemsVisitor from './visitors/json-schema/ItemsVisitor.ts';
import JSONSchemaExamplesVisitor from './visitors/json-schema/ExamplesVisitor.ts';
import LinkDescriptionVisitor from './visitors/json-schema/link-description/index.ts';

const specification = pipe(
  // JSON Schema object modifications
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', 'element'], 'jSONSchemaDraft6'),
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', '$visitor'], JSONSchemaVisitor),
  dissocPath(['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'id']),
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', '$id'], {
    $ref: '#/visitors/value',
  }),
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'contains'], {
    $visitor: specificationObj.visitors.JSONSchemaOrJSONReferenceVisitor,
    alias: 'containsField',
  }),
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'items'], {
    $visitor: JSONSchemaItemsVisitor,
    alias: 'itemsField',
  }),
  assocPath(
    ['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'propertyNames'],
    specificationObj.visitors.JSONSchemaOrJSONReferenceVisitor,
  ),
  assocPath(['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'const'], {
    $ref: '#/visitors/value',
  }),
  assocPath(
    ['visitors', 'document', 'objects', 'JSONSchema', 'fixedFields', 'examples'],
    JSONSchemaExamplesVisitor,
  ),
  // Link Description object modifications
  assocPath(
    ['visitors', 'document', 'objects', 'LinkDescription', '$visitor'],
    LinkDescriptionVisitor,
  ),
  assocPath(
    ['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'hrefSchema'],
    specificationObj.visitors.JSONSchemaOrJSONReferenceVisitor,
  ),
  dissocPath(['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'schema']),
  assocPath(
    ['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'submissionSchema'],
    specificationObj.visitors.JSONSchemaOrJSONReferenceVisitor,
  ),
  dissocPath(['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'method']),
  dissocPath(['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'encType']),
  assocPath(
    ['visitors', 'document', 'objects', 'LinkDescription', 'fixedFields', 'submissionEncType'],
    { $ref: '#/visitors/value' },
  ),
)(specificationObj);

export default specification as typeof specificationObj;
