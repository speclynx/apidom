import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import { ParentSchemaAwareVisitorOptions } from './ParentSchemaAwareVisitor.ts';
import { OneOfVisitorBase } from './bases.ts';
import { isJSONReferenceLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export interface OneOfVisitorOptions
  extends SpecificationVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class OneOfVisitor extends OneOfVisitorBase {
  declare public readonly element: ArrayElement;

  constructor(options: OneOfVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-oneOf');
  }

  ArrayElement(path: Path<ArrayElement>) {
    const arrayElement = path.node;
    arrayElement.forEach((item: Element): void => {
      const specPath = isJSONReferenceLikeElement(item)
        ? ['document', 'objects', 'JSONReference']
        : ['document', 'objects', 'JSONSchema'];
      const element = this.toRefractedElement(specPath, item);
      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    path.stop();
  }
}

export default OneOfVisitor;
