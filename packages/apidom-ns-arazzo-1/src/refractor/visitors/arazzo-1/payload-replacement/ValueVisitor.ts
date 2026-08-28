import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseAlternatingFallbackVisitor, BaseAlternatingFallbackVisitorOptions } from '../bases.ts';
import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';
import { isSelectorLikeElement } from '../../../predicates.ts';

export type { BaseAlternatingFallbackVisitorOptions as ValueVisitorOptions };

/**
 * @public
 */
class ValueVisitor extends BaseAlternatingFallbackVisitor {
  constructor(options: BaseAlternatingFallbackVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isSelectorLikeElement, specPath: ['document', 'objects', 'Selector'] },
      { predicate: stubTrue, specPath: ['value'] },
    ];
  }

  ObjectElement(path: Path<ObjectElement>) {
    AlternatingVisitor.prototype.enter.call(this, path);
  }
}

export default ValueVisitor;
