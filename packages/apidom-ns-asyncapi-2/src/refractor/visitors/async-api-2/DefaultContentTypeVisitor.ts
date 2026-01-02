import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import DefaultContentTypeElement from '../../../elements/DefaultContentType.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type DefaultContentTypeVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class DefaultContentTypeVisitor extends BaseSpecificationVisitor {
  declare public element: DefaultContentTypeElement;

  StringElement(stringElement: StringElement) {
    const defaultContentTypeElement = new DefaultContentTypeElement(
      toValue(stringElement) as string,
    );

    this.copyMetaAndAttributes(stringElement, defaultContentTypeElement);

    this.element = defaultContentTypeElement;
    return BREAK;
  }
}

export default DefaultContentTypeVisitor;
