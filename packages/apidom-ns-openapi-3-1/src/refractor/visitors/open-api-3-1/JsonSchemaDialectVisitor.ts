import { StringElement } from '@speclynx/apidom-datamodel';
import { BREAK, toValue } from '@speclynx/apidom-core';

import JsonSchemaDialectElement from '../../../elements/JsonSchemaDialect.ts';
import { BaseSpecificationVisitor, BaseSpecificationVisitorOptions } from './bases.ts';

/**
 * @public
 */
export interface JsonSchemaDialectVisitorOptions extends BaseSpecificationVisitorOptions {}

/**
 * @public
 */
class JsonSchemaDialectVisitor extends BaseSpecificationVisitor {
  declare public element: JsonSchemaDialectElement;

  StringElement(stringElement: StringElement) {
    const jsonSchemaDialectElement = new JsonSchemaDialectElement(
      toValue(stringElement) as string | undefined,
    );

    this.copyMetaAndAttributes(stringElement, jsonSchemaDialectElement);

    this.element = jsonSchemaDialectElement;
    return BREAK;
  }
}

export default JsonSchemaDialectVisitor;
