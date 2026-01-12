import { T as stubTrue, always } from 'ramda';
import { ObjectElement, StringElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import PathsElement from '../../../../elements/Paths.ts';
import PathItemElement from '../../../../elements/PathItem.ts';
import { SpecPath } from '../../generics/PatternedFieldsVisitor.ts';
import { isPathItemElement } from '../../../../predicates.ts';
import { BasePatternedFieldsVisitor, BasePatternedFieldsVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export type { BasePatternedFieldsVisitorOptions as PathsVisitorOptions };

/**
 * @public
 */
class PathsVisitor extends BasePatternedFieldsVisitor {
  declare public readonly element: PathsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'PathItem']>;

  declare protected readonly canSupportSpecificationExtensions: true;

  constructor(options: BasePatternedFieldsVisitorOptions) {
    super(options);
    this.element = new PathsElement();
    this.specPath = always(['document', 'objects', 'PathItem']);
    this.canSupportSpecificationExtensions = true;
    this.fieldPatternPredicate = stubTrue;
  }

  ObjectElement(path: Path<ObjectElement>) {
    BasePatternedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // decorate every PathItemElement with path metadata
    this.element
      .filter(isPathItemElement)
      // @ts-ignore
      .forEach((pathItemElement: PathItemElement, key: StringElement) => {
        key.classes.push('openapi-path-template');
        key.classes.push('path-template');
        pathItemElement.meta.set('path', cloneDeep(key));
      });
  }
}

export default PathsVisitor;
