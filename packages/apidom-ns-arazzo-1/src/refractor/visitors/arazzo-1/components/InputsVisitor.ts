import { always } from 'ramda';

import ComponentsInputsElement from '../../../../elements/nces/ComponentsInputs.ts';
import { SpecPath } from '../../generics/MapVisitor.ts';
import { BaseMapFallbackVisitor, BaseMapFallbackVisitorOptions } from '../bases.ts';

/**
 * @public
 */
export interface InputsVisitorOptions extends BaseMapFallbackVisitorOptions {}

/**
 * @public
 */
class InputsVisitor extends BaseMapFallbackVisitor {
  declare public readonly element: ComponentsInputsElement;

  declare protected readonly specPath: SpecPath<['document', 'objects', 'JSONSchema']>;

  constructor(options: InputsVisitorOptions) {
    super(options);
    this.element = new ComponentsInputsElement();
    this.specPath = always(['document', 'objects', 'JSONSchema']);
    this.fieldPatternPredicate = (value: unknown) => /^[a-zA-Z0-9.\-_]+$/.test(String(value));
  }
}

export default InputsVisitor;
