import { StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

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

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const defaultContentTypeElement = new DefaultContentTypeElement(
      toValue(stringElement) as string,
    );

    this.copyMetaAndAttributes(stringElement, defaultContentTypeElement);

    this.element = defaultContentTypeElement;
    path.stop();
  }
}

export default DefaultContentTypeVisitor;
