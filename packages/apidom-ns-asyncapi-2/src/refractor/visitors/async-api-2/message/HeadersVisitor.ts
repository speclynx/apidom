import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseAlternatingVisitor, BaseAlternatingVisitorOptions } from '../bases.ts';
import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type HeadersVisitorOptions = BaseAlternatingVisitorOptions;

/**
 * @public
 */
class HeadersVisitor extends BaseAlternatingVisitor {
  constructor(options: HeadersVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isReferenceLikeElement, specPath: ['document', 'objects', 'Reference'] },
      { predicate: stubTrue, specPath: ['document', 'objects', 'Schema'] },
    ];
  }

  ObjectElement(path: Path<ObjectElement>) {
    AlternatingVisitor.prototype.enter.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'schema');
    }
  }
}

export default HeadersVisitor;
