import { ObjectElement } from '@speclynx/apidom-datamodel';

import { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import { MapVisitorOptions, SpecPath } from '../generics/MapVisitor.ts';
import { ParentSchemaAwareVisitorOptions } from './ParentSchemaAwareVisitor.ts';
import { PatternPropertiesVisitorBase } from './bases.ts';
import { isJSONReferenceLikeElement } from '../../predicates.ts';

/**
 * @public
 */
export interface PatternPropertiesVisitorOptions
  extends MapVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
class PatternPropertiesVisitor extends PatternPropertiesVisitorBase {
  declare public readonly element: ObjectElement;

  declare protected readonly specPath: SpecPath<
    ['document', 'objects', 'JSONReference'] | ['document', 'objects', 'JSONSchema']
  >;

  constructor(options: PatternPropertiesVisitorOptions) {
    super(options);
    this.element = new ObjectElement();
    this.element.classes.push('json-schema-patternProperties');
    this.specPath = (element: unknown) =>
      isJSONReferenceLikeElement(element)
        ? ['document', 'objects', 'JSONReference']
        : ['document', 'objects', 'JSONSchema'];
  }
}

export default PatternPropertiesVisitor;
