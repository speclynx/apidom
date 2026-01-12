import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import AlternatingVisitor from '../../generics/AlternatingVisitor.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import { BaseAlternatingVisitor, BaseAlternatingVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type SchemaVisitorOptions = BaseAlternatingVisitorOptions;

/**
 * @public
 */
class SchemaVisitor extends BaseAlternatingVisitor {
  constructor(options: SchemaVisitorOptions) {
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

export default SchemaVisitor;
