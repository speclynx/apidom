import { Element } from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * @public
 */
export type Callback = (path: Path<Element>) => void;

/**
 * @public
 */
export interface ForEachOptions {
  callback?: Callback;
  predicate?: (path: Path<Element>) => boolean;
}

/**
 * Executes the callback on this element's path and all descendant paths.
 * @public
 */
const forEach = <T extends Element>(element: T, options: Callback | ForEachOptions): void => {
  let callback: Callback;
  let predicate: (path: Path<Element>) => boolean;

  if (typeof options === 'function') {
    callback = options;
    predicate = () => true;
  } else {
    callback = options.callback ?? (() => {});
    predicate = options.predicate ?? (() => true);
  }

  traverse(element, {
    enter(path: Path<Element>) {
      if (predicate(path)) {
        callback(path);
      }
    },
  });
};

export default forEach;
