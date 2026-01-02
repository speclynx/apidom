import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import AsyncApiVersionElement from '../../../elements/AsyncApiVersion.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

/**
 * @public
 */
export type AsyncApiVersionVisitorOptions = BaseSpecificationVisitorOptions;

/**
 * @public
 */
class AsyncApiVersionVisitor extends BaseSpecificationVisitor {
  declare public element: AsyncApiVersionElement;

  StringElement(stringElement: StringElement) {
    const asyncApiVersionElement = new AsyncApiVersionElement(toValue(stringElement) as string);

    this.copyMetaAndAttributes(stringElement, asyncApiVersionElement);

    this.element = asyncApiVersionElement;
    return BREAK;
  }
}

export default AsyncApiVersionVisitor;
