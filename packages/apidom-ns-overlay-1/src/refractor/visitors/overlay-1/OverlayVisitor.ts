import { StringElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import {
  BaseSpecificationFallbackVisitor,
  BaseSpecificationFallbackVisitorOptions,
} from './bases.ts';
import OverlayElement from '../../../elements/Overlay.ts';

/**
 * @public
 */
export interface OverlayVisitorOptions extends BaseSpecificationFallbackVisitorOptions {}

/**
 * @public
 */
class OverlayVisitor extends BaseSpecificationFallbackVisitor {
  declare public element: OverlayElement;

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const overlayElement = new OverlayElement(stringElement.toValue() as string);

    this.copyMetaAndAttributes(stringElement, overlayElement);
    this.element = overlayElement;

    path.stop();
  }
}

export default OverlayVisitor;
