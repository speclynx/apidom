import { always } from 'ramda';

import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import ChannelBindingsElement from '../../../../elements/ChannelBindings.ts';

/**
 * @public
 */
export type ChannelBindingsVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class ChannelBindingsVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ChannelBindingsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ChannelBindings']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ChannelBindingsVisitorOptions) {
    super(options);
    this.element = new ChannelBindingsElement();
    this.specPath = always(['document', 'objects', 'ChannelBindings']);
    this.canSupportSpecificationExtensions = true;
  }
}

export default ChannelBindingsVisitor;
