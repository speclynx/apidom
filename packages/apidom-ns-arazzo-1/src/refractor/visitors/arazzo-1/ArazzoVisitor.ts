import { Mixin } from 'ts-mixer';
import { StringElement, BREAK, toValue } from '@speclynx/apidom-core';

import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import ArazzoElement from '../../../elements/Arazzo.ts';

/**
 * @public
 */
export interface ArazzoVisitorOptions extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class ArazzoVisitor extends Mixin(SpecificationVisitor, FallbackVisitor) {
  declare public element: ArazzoElement;

  StringElement(stringElement: StringElement) {
    const arazzoElement = new ArazzoElement(toValue(stringElement));

    this.copyMetaAndAttributes(stringElement, arazzoElement);
    this.element = arazzoElement;

    return BREAK;
  }
}

export default ArazzoVisitor;
