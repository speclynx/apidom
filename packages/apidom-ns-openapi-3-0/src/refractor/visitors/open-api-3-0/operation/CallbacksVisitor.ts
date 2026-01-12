import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';
import ReferenceElement from '../../../../elements/Reference.ts';
import OperationCallbacksElement from '../../../../elements/nces/OperationCallbacks.ts';
import MapVisitor, { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BaseMapVisitorOptions as CallbacksVisitorOptions };

/**
 * @public
 */
class CallbacksVisitor extends BaseMapVisitor {
  declare public readonly element: OperationCallbacksElement;

  protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Callback']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new OperationCallbacksElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Callback'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    MapVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'callback');
    });
  }
}

export default CallbacksVisitor;
