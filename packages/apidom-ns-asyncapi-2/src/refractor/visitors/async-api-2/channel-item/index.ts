import { always } from 'ramda';
import { ObjectElement, isStringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import ChannelItemElement from '../../../../elements/ChannelItem.ts';
import { BaseFixedFieldsVisitor, BaseFixedFieldsVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/FixedFieldsVisitor.ts';

/**
 * @public
 */
export type ChannelItemVisitorOptions = BaseFixedFieldsVisitorOptions;

/**
 * @public
 */
class ChannelItemVisitor extends BaseFixedFieldsVisitor {
  declare public readonly element: ChannelItemElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'ChannelItem']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: ChannelItemVisitorOptions) {
    super(options);
    this.element = new ChannelItemElement();
    this.specPath = always(['document', 'objects', 'ChannelItem']);
    this.canSupportSpecificationExtensions = true;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BaseFixedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // mark this ChannelItemElement with reference metadata
    if (isStringElement(this.element.$ref)) {
      this.element.classes.push('reference-element');
      this.element.meta.set('referenced-element', 'channelItem');
    }
  }
}

export default ChannelItemVisitor;
