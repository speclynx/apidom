import { always } from 'ramda';

import LinkDescriptionElement from '../../../../elements/LinkDescription.ts';
import { SpecPath } from '../../generics/FixedFieldsVisitor.ts';
import { FixedFieldsVisitorOptions } from '../../generics/FixedFieldsVisitor.ts';
import { FallbackVisitorOptions } from '../../FallbackVisitor.ts';
import { LinkDescriptionVisitorBase } from '../bases.ts';

/**
 * @public
 */
export interface LinkDescriptionVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class LinkDescriptionVisitor extends LinkDescriptionVisitorBase {
  declare public readonly element: LinkDescriptionElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'LinkDescription']>;

  constructor(options: LinkDescriptionVisitorOptions) {
    super(options);
    this.element = new LinkDescriptionElement();
    this.specPath = always(['document', 'objects', 'LinkDescription']);
  }
}

export default LinkDescriptionVisitor;
