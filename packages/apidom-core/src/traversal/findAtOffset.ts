import { last, pathOr } from 'ramda';
import { isNumber } from 'ramda-adjunct';
import {
  Element,
  ArrayElement,
  SourceMapElement,
  hasElementSourceMap,
} from '@speclynx/apidom-datamodel';
import { traverse, type Path } from '@speclynx/apidom-traverse';

import toValue from '../transformers/serializers/value.ts';

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
  options: number | FindAtOffsetOptions,
  element: T,
): T | undefined => {
  let offset: number;
  let includeRightBound: boolean;

  if (isNumber(options)) {
    offset = options;
    includeRightBound = false;
  } else {
    offset = pathOr(0, ['offset'], options);
    includeRightBound = pathOr(false, ['includeRightBound'], options);
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
      const charStart: number = toValue(positionStart?.get(2)) as number;
      const charEnd: number = toValue(positionEnd?.get(2)) as number;
      const isWithinOffsetRange =
        offset >= charStart && (offset < charEnd || (includeRightBound && offset <= charEnd));

      if (isWithinOffsetRange) {
        result.push(node as T);
        return; // push to stack and dive in
      }

      path.skip(); // skip entire sub-tree
    },
  });

  return last<T>(result);
};

export default findAtOffset;
