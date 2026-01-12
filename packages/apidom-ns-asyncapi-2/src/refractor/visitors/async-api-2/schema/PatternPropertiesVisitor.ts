import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  PatternPropertiesVisitorOptions,
  PatternPropertiesVisitor as PatternPropertiesVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { PatternPropertiesVisitorOptions };

/**
 * @public
 */
export const JSONSchemaPatternPropertiesVisitor: typeof PatternPropertiesVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.patternProperties;

/**
 * @public
 */
class PatternPropertiesVisitor extends JSONSchemaPatternPropertiesVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaPatternPropertiesVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default PatternPropertiesVisitor;
