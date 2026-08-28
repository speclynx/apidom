import { T as stubTrue } from 'ramda';
import { isObjectElement, ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseAlternatingFallbackVisitor, BaseAlternatingFallbackVisitorOptions } from '../bases.ts';
import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';

export type { BaseAlternatingFallbackVisitorOptions as TargetSelectorTypeVisitorOptions };

/**
 * @public
 */
class TargetSelectorTypeVisitor extends BaseAlternatingFallbackVisitor {
  constructor(options: BaseAlternatingFallbackVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isObjectElement, specPath: ['document', 'objects', 'ExpressionType'] },
      { predicate: stubTrue, specPath: ['value'] },
    ];
  }

  ObjectElement(path: Path<ObjectElement>) {
    AlternatingVisitor.prototype.enter.call(this, path);
  }
}

export default TargetSelectorTypeVisitor;
