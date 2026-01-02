import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';

import { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { ParentSchemaAwareVisitorOptions } from './ParentSchemaAwareVisitor.ts';
import { AllOfVisitorBase } from './bases.ts';
import { isJSONReferenceLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export interface AllOfVisitorOptions
  extends SpecificationVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class AllOfVisitor extends AllOfVisitorBase {
  declare public readonly element: ArrayElement;

  constructor(options: AllOfVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-allOf');
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const specPath = isJSONReferenceLikeElement(item)
        ? ['document', 'objects', 'JSONReference']
        : ['document', 'objects', 'JSONSchema'];
      const element = this.toRefractedElement(specPath, item);
      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default AllOfVisitor;
