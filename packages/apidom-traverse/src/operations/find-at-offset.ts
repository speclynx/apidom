import {
  Element,
  ArrayElement,
  SourceMapElement,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';

import { traverse } from '../traversal.ts';
import type { Path } from '../Path.ts';

/**
 * @public
 */
export interface FindAtOffsetOptions {
  offset: number;
  includeRightBound?: boolean;
}

/**
 * Finds the most inner node at the given offset.
 * If includeRightBound is set, also finds nodes that end at the given offset.
 * @public
 */
const findAtOffset = <T extends Element>(
  element: T,
  options: number | FindAtOffsetOptions,
): T | undefined => {
  let offset: number;
  let includeRightBound: boolean;

  if (typeof options === 'number') {
    offset = options;
    includeRightBound = false;
  } else {
    offset = options.offset ?? 0;
    includeRightBound = options.includeRightBound ?? false;
  }

  const result: T[] = [];

  traverse(element, {
    enter(path: Path<Element>) {
      const node = path.node;

      if (!hasElementSourceMap(node)) {
        return; // dive in
      }

      const sourceMapElement = node.meta.get('sourceMap') as SourceMapElement;
      const positionStart = sourceMapElement.positionStart as ArrayElement | undefined;
      const positionEnd = sourceMapElement.positionEnd as ArrayElement | undefined;
      const charStart: number = (positionStart?.get(2)?.toValue() as number) ?? 0;
      const charEnd: number = (positionEnd?.get(2)?.toValue() as number) ?? 0;
      const isWithinOffsetRange =
        offset >= charStart && (offset < charEnd || (includeRightBound && offset <= charEnd));

      if (isWithinOffsetRange) {
        result.push(node as T);
        return; // push to stack and dive in
      }

      path.skip(); // skip entire sub-tree
    },
  });

  return result.at(-1);
};

export default findAtOffset;
