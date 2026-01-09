import ArrayElement from '../primitives/ArrayElement.ts';
import type Element from '../primitives/Element.ts';
import type { Meta, Attributes } from '../types.ts';
import { includesClasses } from '../predicates/index.ts';

/**
 * Represents a position in the source document.
 * @public
 */
export interface Position {
  row: number;
  column: number;
  char: number;
}

/**
 * Represents a range of positions in the source document.
 * @public
 */
export interface PositionRange {
  start: Position;
  end: Position;
}

/**
 * SourceMapElement represents source location information for an element.
 *
 * Contains start and end positions that map an element back to its
 * location in the original source document.
 *
 * @public
 */
class SourceMapElement extends ArrayElement {
  constructor(content?: unknown[], meta?: Meta, attributes?: Attributes) {
    super(content, meta, attributes);
    this.element = 'sourceMap';
  }

  /**
   * The start position in the source document.
   */
  get positionStart(): Element | undefined {
    return this.filter((item) => includesClasses(item, ['position'])).get(0);
  }

  /**
   * The end position in the source document.
   */
  get positionEnd(): Element | undefined {
    return this.filter((item) => includesClasses(item, ['position'])).get(1);
  }

  /**
   * Sets the position range for this source map.
   */
  set position(position: PositionRange | undefined) {
    if (position === undefined) {
      return;
    }

    const start = new ArrayElement([
      position.start.row,
      position.start.column,
      position.start.char,
    ]);
    const end = new ArrayElement([position.end.row, position.end.column, position.end.char]);

    start.classes.push('position');
    end.classes.push('position');

    this.push(start).push(end);
  }
}

export default SourceMapElement;
