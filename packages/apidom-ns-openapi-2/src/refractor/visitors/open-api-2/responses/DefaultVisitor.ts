import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';

import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement, isResponseElement } from '../../../../predicates.ts';
import { BaseAlternatingVisitor, BaseAlternatingVisitorOptions } from '../bases.ts';
import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';

export type { BaseAlternatingVisitorOptions as DefaultVisitorOptions };

/**
 * @public
 */
class DefaultVisitor extends BaseAlternatingVisitor {
  constructor(options: BaseAlternatingVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isReferenceLikeElement, specPath: ['document', 'objects', 'Reference'] },
      { predicate: stubTrue, specPath: ['document', 'objects', 'Response'] },
    ];
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = AlternatingVisitor.prototype.enter.call(this, objectElement);

    // decorate ReferenceElement with type of referencing element
    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'response');
    } else if (isResponseElement(this.element)) {
      this.element.meta.set('http-status-code', 'default');
    }

    return result;
  }
}

export default DefaultVisitor;
