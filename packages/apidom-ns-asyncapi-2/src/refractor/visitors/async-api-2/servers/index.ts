import { test } from 'ramda';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import { BasePatternedFieldsVisitor, BasePatternedFieldsVisitorOptions } from '../bases.ts';
import type { SpecPath } from '../../generics/PatternedFieldsVisitor.ts';
import ServersElement from '../../../../elements/Servers.ts';
import ReferenceElement from '../../../../elements/Reference.ts';
import { isReferenceLikeElement } from '../../../predicates.ts';
import { isReferenceElement } from '../../../../predicates.ts';

/**
 * @public
 */
export type ServersVisitorOptions = BasePatternedFieldsVisitorOptions;

/**
 * @public
 */
class ServersVisitor extends BasePatternedFieldsVisitor {
  declare public readonly element: ServersElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'Reference'] | ['document', 'objects', 'Server']
  >;

  declare protected readonly canSupportSpecificationExtensions: false;

  constructor(options: ServersVisitorOptions) {
    super(options);
    this.element = new ServersElement();
    this.element.classes.push('servers');
    this.specPath = (element: unknown) => {
      return isReferenceLikeElement(element)
        ? ['document', 'objects', 'Reference']
        : ['document', 'objects', 'Server'];
    };
    this.canSupportSpecificationExtensions = false;
    // @ts-ignore
    this.fieldPatternPredicate = test(/^[A-Za-z0-9_-]+$/);
  }

  ObjectElement(path: Path<ObjectElement>) {
    BasePatternedFieldsVisitor.prototype.ObjectElement.call(this, path);

    // @ts-ignore
    this.element.filter(isReferenceElement).forEach((referenceElement: ReferenceElement) => {
      referenceElement.meta.set('referenced-element', 'server');
    });
  }
}

export default ServersVisitor;
