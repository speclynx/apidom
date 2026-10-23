import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

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

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const asyncApiVersionElement = new AsyncApiVersionElement(stringElement.toValue() as string);

    this.copyMetaAndAttributes(stringElement, asyncApiVersionElement);

    this.element = asyncApiVersionElement;
    path.stop();
  }
}

export default AsyncApiVersionVisitor;
