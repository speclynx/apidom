import { always } from 'ramda';

import DiscriminatorElement from '../../../../elements/Discriminator.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';

export type { BaseFixedFieldsVisitorOptions as DiscriminatorVisitorOptions };

/**
 * @public
 */
class DiscriminatorVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: DiscriminatorElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Discriminator']>;

  declare protected canSupportSpecificationExtensions: boolean;

  constructor(options: BaseFixedFieldsVisitorOptions) {
    super(options);
    this.element = new DiscriminatorElement();
    this.specPath = always(['document', 'objects', 'Discriminator']);
    this.canSupportSpecificationExtensions = false;
  }
}

export default DiscriminatorVisitor;
