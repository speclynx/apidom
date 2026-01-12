import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import {
  specificationObj as JSONSchemaDraft7Specification,
  DependenciesVisitorOptions,
  DependenciesVisitor as DependenciesVisitorType,
} from '@speclynx/apidom-ns-json-schema-draft-7';

import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceElement } from '../../../../predicates.ts';

export type { DependenciesVisitorOptions };

/**
 * @public
 */
export const JSONSchemaDependenciesVisitor: typeof DependenciesVisitorType =
  JSONSchemaDraft7Specification.visitors.document.objects.JSONSchema.fixedFields.dependencies;

/**
 * @public
 */
class DependenciesVisitor extends JSONSchemaDependenciesVisitor {
  ObjectElement(path: Path<ObjectElement>) {
    JSONSchemaDependenciesVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'schema');
    });
  }
}

export default DependenciesVisitor;
