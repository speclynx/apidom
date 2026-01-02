import { ObjectElement } from '@speclynx/apidom-datamodel';
import {
  isJSONReferenceLikeElement,
  isJSONReferenceElement,
  JSONReferenceElement,
} from '@speclynx/apidom-ns-json-schema-draft-4';

import DefinitionsElement from '../../../../elements/Definitions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as DefinitionsVisitorOptions };

/**
 * @public
 */
class DefinitionsVisitor extends BaseMapVisitor {
  declare public readonly element: DefinitionsElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'JSONReference'] | ['document', 'objects', 'Schema']
  >;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new DefinitionsElement();
    this.specPath = (element: unknown) => {
      return isJSONReferenceLikeElement(element)
        ? ['document', 'objects', 'JSONReference']
        : ['document', 'objects', 'Schema'];
    };
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = BaseMapVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every JSONReferenceElement with metadata about their referencing type
    this.element
      .filter(isJSONReferenceElement)
      // @ts-ignore
      .forEach((referenceElement: JSONReferenceElement) => {
        referenceElement.meta.set('referenced-element', 'schema');
      });

    return result;
  }
}

export default DefinitionsVisitor;
