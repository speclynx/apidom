import { ArrayElement, Element } from '@speclynx/apidom-datamodel';
import { BREAK } from '@speclynx/apidom-core';
import {
  BaseSchemaArrayVisitor,
  BaseSchemaArrayVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2019-09';

/**
 * @public
 */
export type PrefixItemsVisitorOptions = BaseSchemaArrayVisitorOptions;

/**
 * @public
 */
class PrefixItemsVisitor extends BaseSchemaArrayVisitor {
  declare public readonly element: ArrayElement;

  constructor(options: PrefixItemsVisitorOptions) {
    super(options);
    this.element = new ArrayElement();
    this.element.classes.push('json-schema-prefixItems');
  }

  ArrayElement(arrayElement: ArrayElement) {
    arrayElement.forEach((item: Element): void => {
      const element = this.toRefractedElement(['document', 'objects', 'JSONSchema'], item);

      this.element.push(element);
    });

    this.copyMetaAndAttributes(arrayElement, this.element);

    return BREAK;
  }
}

export default PrefixItemsVisitor;
