import { StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';

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

  StringElement(path: Path<StringElement>) {
    const stringElement = path.node;
    const jsonSchemaDialectElement = new JsonSchemaDialectElement(
      toValue(stringElement) as string | undefined,
    );

    this.copyMetaAndAttributes(stringElement, jsonSchemaDialectElement);

    this.element = jsonSchemaDialectElement;
    path.stop();
  }
}

export default JsonSchemaDialectVisitor;
