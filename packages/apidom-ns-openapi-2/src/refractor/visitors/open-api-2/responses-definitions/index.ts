import { always } from 'ramda';

import ResponsesDefinitionsElement from '../../../../elements/ResponsesDefinitions.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapVisitor, BaseMapVisitorOptions } from '../bases.ts';

export type { BaseMapVisitorOptions as ResponsesDefinitionsVisitorOptions };

/**
 * @public
 */
class ResponsesDefinitionsVisitor extends BaseMapVisitor {
  declare public readonly element: ResponsesDefinitionsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'Response']>;

  constructor(options: BaseMapVisitorOptions) {
    super(options);
    this.element = new ResponsesDefinitionsElement();
    this.specPath = always(['document', 'objects', 'Response']);
  }
}

export default ResponsesDefinitionsVisitor;
