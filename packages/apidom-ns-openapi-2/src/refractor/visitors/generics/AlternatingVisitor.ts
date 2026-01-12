import { ifElse, always } from 'ramda';
import { dispatch, stubUndefined } from 'ramda-adjunct';
import { Element } from '@speclynx/apidom-datamodel';
import { Path } from '@speclynx/apidom-traverse';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';

/**
 * @public
 */
export type Alternator = { predicate: (element: unknown) => boolean; specPath: string[] };

/**
 * @public
 */
export interface AlternatingVisitorOptions extends SpecificationVisitorOptions {
  readonly alternator?: Alternator[];
}

/**
 * @public
 */
class AlternatingVisitor extends SpecificationVisitor {
  protected alternator: Alternator[];

  constructor({ alternator, ...rest }: AlternatingVisitorOptions) {
    super({ ...rest });
    this.alternator = alternator || [];
  }

  enter(path: Path<Element>) {
    const element = path.node;
    const functions = this.alternator.map(
      ({ predicate, specPath }: { predicate: (element: unknown) => boolean; specPath: string[] }) =>
        ifElse(predicate, always(specPath), stubUndefined),
    );
    const specPath = dispatch(functions)(element);

    this.element = this.toRefractedElement(specPath, element);

    path.stop();
  }
}

export default AlternatingVisitor;
