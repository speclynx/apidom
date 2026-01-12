import { Element, ObjectElement, ArrayElement, isArrayElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from '../bases.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import OperationMessageMapElement from '../../../../elements/nces/OperationMessageMap.ts';
import OperationMessageElement from '../../../../elements/nces/OperationMessage.ts';

/**
 * @public
 */
export type MessageVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class MessageVisitor extends BaseSpecificationVisitor {
  declare public element: OperationMessageMapElement;

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;

    if (isReferenceLikeElement(objectElement)) {
      this.element = this.toRefractedElement(['document', 'objects', 'Reference'], objectElement);
      this.element.meta.set('referenced-element', 'message');
    } else if (isArrayElement(objectElement.get('oneOf'))) {
      this.element = new OperationMessageMapElement();
      const operationMessageElement = new OperationMessageElement();
      const oneOfElement = objectElement.get('oneOf') as ArrayElement;

      oneOfElement.forEach((item: Element) => {
        let element;
        const itemObject = item as ObjectElement;

        if (isReferenceLikeElement(itemObject)) {
          element = this.toRefractedElement(['document', 'objects', 'Reference'], itemObject);
          element.meta.set('referenced-element', 'message');
        } else {
          element = this.toRefractedElement(['document', 'objects', 'Message'], itemObject);
        }

        operationMessageElement.push(element);
      });

      this.element.oneOf = operationMessageElement;
    } else {
      this.element = this.toRefractedElement(['document', 'objects', 'Message'], objectElement);
    }

    this.copyMetaAndAttributes(objectElement, this.element);

    path.stop();
  }
}

export default MessageVisitor;
