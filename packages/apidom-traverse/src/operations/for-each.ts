import { Element, isElement } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * @public
 */
export type Callback = <T extends Element>(element: T) => void;

/**
 * @public
 */
export interface ForEachOptions {
  callback?: Callback;
  predicate?: (element: Element) => boolean;
}

/**
 * Executes the callback on this element and all descendants.
 * @public
 */
const forEach = <T extends Element>(element: T, options: Callback | ForEachOptions): void => {
  let callback: Callback;
  let predicate: (element: Element) => boolean;

  if (typeof options === 'function') {
    callback = options;
    predicate = isElement;
  } else {
    callback = options.callback ?? (() => {});
    predicate = options.predicate ?? isElement;
  }

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path.node)) {
        callback(path.node);
      }
    },
  });
};

export default forEach;
