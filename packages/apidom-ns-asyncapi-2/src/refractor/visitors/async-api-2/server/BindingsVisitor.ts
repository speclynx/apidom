import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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
      { predicate: stubTrue, specPath: ['document', 'objects', 'ServerBindings'] },
    ];
  }

  ObjectElement(path: Path<ObjectElement>) {
    AlternatingVisitor.prototype.enter.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'serverBindings');
    }
  }
}

export default BindingsVisitor;
