import {
  ArrayElement,
  Element,
  MemberElement,
  ObjectElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SelectorElement from '../../../../elements/Selector.ts';
import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from '../bases.ts';
import { isSelectorLikeElement } from '../../../predicates.ts';

/**
 * @public
 */
export interface PayloadVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * Payload is `Any` value which can contain Selector Objects at any nesting level.
 * @public
 */
class PayloadVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: Element | SelectorElement;

  ObjectElement(path: Path<ObjectElement>) {
    const objectElement = path.node;

    if (isSelectorLikeElement(objectElement)) {
      this.element = this.toRefractedElement(['document', 'objects', 'Selector'], objectElement);
      path.stop();
      return;
    }

    const element = new ObjectElement();
    // @ts-ignore
    objectElement.forEach((value: Element, key: Element, memberElement: MemberElement) => {
      const valueElement = this.toRefractedElement(
        ['document', 'objects', 'RequestBody', 'fixedFields', 'payload'],
        value,
      );
      const newMemberElement = new MemberElement(this.consume ? key : cloneDeep(key), valueElement);
      this.copyMetaAndAttributes(memberElement, newMemberElement);
      element.push(newMemberElement);
    });
    this.copyMetaAndAttributes(objectElement, element);
    this.element = element;

    path.stop();
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    const element = new ArrayElement();

    arrayElement.forEach((item: Element): void => {
      const itemElement = this.toRefractedElement(
        ['document', 'objects', 'RequestBody', 'fixedFields', 'payload'],
        item,
      );
      element.push(itemElement);
    });
    this.copyMetaAndAttributes(arrayElement, element);
    this.element = element;

    path.stop();
  }
}

export default PayloadVisitor;
