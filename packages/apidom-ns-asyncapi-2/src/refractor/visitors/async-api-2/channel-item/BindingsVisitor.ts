import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseAlternatingVisitor, BaseAlternatingVisitorOptions } from '../bases.ts';
import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';

/**
 * @public
 */
export type BindingsVisitorOptions = BaseAlternatingVisitorOptions;

/**
 * @public
 */
class BindingsVisitor extends BaseAlternatingVisitor {
  constructor(options: BindingsVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isReferenceLikeElement, specPath: ['document', 'objects', 'Reference'] },
      { predicate: stubTrue, specPath: ['document', 'objects', 'ChannelBindings'] },
    ];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = AlternatingVisitor.prototype.enter.call(this, objectElement);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'channelBindings');
    }

    return result;
  }
}

export default BindingsVisitor;
