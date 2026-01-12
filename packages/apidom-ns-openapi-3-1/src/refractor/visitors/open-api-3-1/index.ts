import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';
import { FixedFieldsVisitor, SpecPath } from '@speclynx/apidom-ns-openapi-3-0';

import OpenApi3_1Element from '../../../elements/OpenApi3-1.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from './bases.ts';

/**
 * @public
 */

export interface OpenApi3_1VisitorOptions extends BaseFixedFieldsVisitorOptions {}

/**
 * @public
 */

class OpenApi3_1Visitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OpenApi3_1Element;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OpenApi']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  declare protected readonly openApiSemanticElement: OpenApi3_1Element;

  constructor(options: OpenApi3_1VisitorOptions) {
    super(options);
    this.element = new OpenApi3_1Element();
    this.specPath = always(['document', 'objects', 'OpenApi']);
    this.canSupportSpecificationExtensions = true;
    this.openApiSemanticElement = this.element;
  }

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;
    this.openApiGenericElement = objectElement;

    FixedFieldsVisitor.prototype.ObjectElement.call(this, path);
  }
}

export default OpenApi3_1Visitor;
