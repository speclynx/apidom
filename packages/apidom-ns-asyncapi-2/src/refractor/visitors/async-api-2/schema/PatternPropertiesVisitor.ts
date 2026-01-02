import { ObjectElement } from '@speclynx/apidom-datamodel';
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
  ObjectElement(objectElement: ObjectElement) {
    const result = JSONSchemaPatternPropertiesVisitor.prototype.ObjectElement.call(
      this,
      objectElement,
    );

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });

    return result;
  }
}

export default PatternPropertiesVisitor;
