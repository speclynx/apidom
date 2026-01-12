import { ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { Path } from '@speclynx/apidom-traverse';
import { isReferenceLikeElement, MapVisitor, SpecPath } from '@speclynx/apidom-ns-openapi-3-0';

import ReferenceElement from '../../../elements/Reference.ts';
import PathItemElement from '../../../elements/PathItem.ts';
import WebhooksElement from '../../../elements/nces/Webhooks.ts';
import { isPathItemElement, isReferenceElement } from '../../../predicates.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from './bases.ts';

/**
 * @public
 */
export interface WebhooksVisitorOptions extends BaseMapVisitorOptions {}

/**
 * @public
 */
class WebhooksVisitor extends BaseMapVisitor {
  declare public readonly element: WebhooksElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'PathItem']
  >;

  constructor(options: WebhooksVisitorOptions) {
    super(options);
    this.element = new WebhooksElement();
    this.specPath = (element: unknown) =>
      isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'PathItem'];
  }

  ObjectElement(path: Path<ObjectElement>) {
    MapVisitor.prototype.ObjectElement.call(this, path);

    // decorate every ReferenceElement with metadata about their referencing type
    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      // @ts-ignore
      referenceElement.setMetaProperty('referenced-element', 'pathItem');
    });

    // decorate every PathItemElement with Webhook name metadata
    this.element
      .filter(isPathItemElement)
      // @ts-ignore
      .forEach((pathItemElement: PathItemElement, key: StringElement) => {
        // @ts-ignore
        pathItemElement.setMetaProperty('webhook-name', toValue(key));
      });
  }
}

export default WebhooksVisitor;
