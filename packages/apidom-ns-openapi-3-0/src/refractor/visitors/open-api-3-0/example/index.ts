import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ExampleElement from '../../../../elements/Example.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as ExampleVisitorOptions };

/**
 * @public
 */
class ExampleVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ExampleElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Example']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new ExampleElement();
    this.specPath = always(['document', 'objects', 'Example']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // mark this ExampleElement with reference metadata
    if (isStringElement(this.element.externalValue)) {
      this.element.classes.push('reference-element');
    }
  }
}

export default ExampleVisitor;
