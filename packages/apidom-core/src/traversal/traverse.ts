import { Element, isElement } from '@speclynx/apidom-datamodel';
import { pathOr } from 'ramda';
import { isFunction, noop } from 'ramda-adjunct';
import { traverse as apidomTraverse, type Path } from '@speclynx/apidom-traverse';

/**
 * @public
 */
export type Callback = <T extends Element>(element: T) => void;

/**
 * @public
 */
export interface TraverseOptions {
  callback?: Callback;
  predicate?: (element: any) => boolean;
}

/**
 * Executes the callback on this element and all descendants.
 * @public
 */
const traverse = <T extends Element>(options: Callback | TraverseOptions, element: T): void => {
  let callback: Callback;
  let predicate: (element: any) => boolean;

  if (isFunction(options)) {
    callback = options;
    predicate = isElement;
  } else {
    callback = pathOr(noop, ['callback'], options);
    predicate = pathOr(isElement, ['predicate'], options);
  }

  apidomTraverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path.node)) {
        callback(path.node);
      }
    },
  });
};

export default traverse;
