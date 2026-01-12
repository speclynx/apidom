import { T as stubTrue } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { isReferenceElement } from '../../../../predicates.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import AlternatingVisitor, {
  AlternatingVisitorOptions,
} from '../../generics/AlternatingVisitor.ts';
import { FallbackVisitorOptions } from '../../FallbackVisitor.ts';

/**
 * @public
 */
export interface RequestBodyVisitorOptions
  extends AlternatingVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class RequestBodyVisitor extends AlternatingVisitor {
  constructor(options: RequestBodyVisitorOptions) {
    super(options);
    this.alternator = [
      { predicate: isReferenceLikeElement, specPath: ['document', 'objects', 'Reference'] },
      { predicate: stubTrue, specPath: ['document', 'objects', 'RequestBody'] },
    ];
  }

  ObjectElement(path: Path<ObjectElement>) {
    AlternatingVisitor.prototype.enter.call(this, path);

    if (isReferenceElement(this.element)) {
      this.element.meta.set('referenced-element', 'requestBody');
    }
  }
}

export default RequestBodyVisitor;
