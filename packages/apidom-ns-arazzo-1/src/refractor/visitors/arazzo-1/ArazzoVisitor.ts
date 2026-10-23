import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from './bases.ts';
import ArazzoElement from '../../../elements/Arazzo.ts';

/**
 * @public
 */
export interface ArazzoVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class ArazzoVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: ArazzoElement;

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const arazzoElement = new ArazzoElement(stringElement.toValue() as string);

    this.copyMetaAndAttributes(stringElement, arazzoElement);
    this.element = arazzoElement;

    path.stop();
  }
}

export default ArazzoVisitor;
