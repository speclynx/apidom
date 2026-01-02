import { always } from 'ramda';
import { ObjectElement, StringElement } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import CallbackElement from '../../../../elements/Callback.ts';
import PathItemElement from '../../../../elements/PathItem.ts';
import { SpecPath } from '../../generics/PatternedFieldsVisitor.ts';
import MapVisitor from '../../generics/MapVisitor.ts';
import { isPathItemElement } from '../../../../predicates.ts';
import { BasePatternedFieldsVisitor, BasePatternedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BasePatternedFieldsVisitorOptions as CallbackVisitorOptions };

/**
 * @public
 */
class CallbackVisitor extends BasePatternedFieldsVisitor {
  declare public readonly element: CallbackElement;

  declare protected readonly specPath: SpecPath;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BasePatternedFieldsVisitorOptions) {
    super(options);
    this.element = new CallbackElement();
    this.specPath = always(['document', 'objects', 'PathItem']);
    this.canSupportSpecificationExtensions = true;
    this.fieldPatternPredicate = (value) => /{(?<expression>[^}]{1,2083})}/.test(String(value)); // 2,083 characters is the maximum length of a URL in Chrome
  }

  ObjectElement(objectElement: ObjectElement) {
    const result = MapVisitor.prototype.ObjectElement.call(this, objectElement);

    // decorate every PathItemElement with Callback Object expression metadata
    this.element
      .filter(isPathItemElement)
      // @ts-ignore
      .forEach((pathItemElement: PathItemElement, key: StringElement) => {
        pathItemElement.meta.set('runtime-expression', toValue(key));
      });

    return result;
  }
}

export default CallbackVisitor;
