import { always } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { SpecPath } from '../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from './bases.ts';
import OpenApi3_0Element from '../../../elements/OpenApi3-0.ts';

/**
 * @public
 */

export type { BaseFixedFieldsVisitorOptions as OpenApi3_0VisitorOptions };

/**
 * @public
 */

class OpenApi3_0Visitor extends BaseFixedFieldsVisitor {
  declare public readonly element: OpenApi3_0Element;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'OpenApi']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new OpenApi3_0Element();
    this.specPath = always(['document', 'objects', 'OpenApi']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);
  }
}

export default OpenApi3_0Visitor;
