import {
  Element,
  ObjectElement,
  ArrayElement,
  StringElement,
  BooleanElement,
  isObjectElement,
  isArrayElement,
} from '@speclynx/apidom-datamodel';
import { NormalizedPath } from '@speclynx/apidom-json-path';
import {
  ActionElement,
  Overlay1Element,
  InfoElement,
  OverlayElement,
  ActionsElement,
} from '@speclynx/apidom-ns-overlay-1';

import OverlayError from '../../errors/OverlayError.ts';

/**
 * @public
 */
export interface DiffOptions {
  readonly overlay?: string;
  readonly info?: { title?: string; description?: string; version?: string };
  readonly extends?: string;
  /**
   * Controls behavior when the two documents are identical and the diff produces no actions.
   * - `'allow'` (default) — returns an overlay with an empty `actions` array
   * - `'throw'` — throws {@link OverlayError}
   */
  readonly onEmptyDiff?: 'allow' | 'throw';
}

const defaultDiffOptions = {
  overlay: '1.1.0',
  info: { title: 'API diff', version: '0.0.0' },
} as const;

type Segments = (string | number)[];

const createUpdateAction = (segments: Segments, value: Element): ActionElement => {
  const action = new ActionElement();
  action.target = new StringElement(NormalizedPath.from(segments));
  action.update = value;
  return action;
};

const createRemoveAction = (segments: Segments): ActionElement => {
  const action = new ActionElement();
  action.target = new StringElement(NormalizedPath.from(segments));
  action.removeField = new BooleanElement(true);
  return action;
};

const diffElements = (
  left: Element,
  right: Element,
  segments: Segments,
  actions: ActionElement[],
): void => {
  if (left.equals(right)) return;

  const leftKind = left.primitive();
  const rightKind = right.primitive();

  if (leftKind !== rightKind) {
    if (segments.length === 0) {
      throw new OverlayError('Cannot diff documents with incompatible root types');
    }
    // structural type change: remove old, re-add new via parent update.
    // only reachable from diffObjects — segments tail is always a string key
    actions.push(createRemoveAction(segments));
    const key = segments[segments.length - 1];
    const wrapper = new ObjectElement();
    wrapper.set(key as string, right);
    actions.push(createUpdateAction(segments.slice(0, -1), wrapper));
    return;
  }

  if (isObjectElement(left) && isObjectElement(right)) {
    diffObjects(left, right, segments, actions);
    return;
  }

  if (isArrayElement(left) && isArrayElement(right)) {
    diffArrays(left, right, segments, actions);
    return;
  }

  // primitive value changed
  actions.push(createUpdateAction(segments, right));
};

const diffObjects = (
  left: ObjectElement,
  right: ObjectElement,
  segments: Segments,
  actions: ActionElement[],
): void => {
  const leftKeys = new Set(left.keys() as string[]);
  const rightKeys = new Set(right.keys() as string[]);

  // removed keys
  for (const key of leftKeys) {
    if (!rightKeys.has(key)) {
      actions.push(createRemoveAction([...segments, key]));
    }
  }

  // added keys — batched into a single parent update to minimize action count
  const added: string[] = [];
  for (const key of rightKeys) {
    if (!leftKeys.has(key)) added.push(key);
  }
  if (added.length > 0) {
    const patch = new ObjectElement();
    for (const key of added) {
      patch.set(key, right.get(key));
    }
    actions.push(createUpdateAction(segments, patch));
  }

  // common keys — recurse into changed values
  for (const key of leftKeys) {
    if (!rightKeys.has(key)) continue;
    diffElements(left.get(key) as Element, right.get(key) as Element, [...segments, key], actions);
  }
};

const diffArrays = (
  left: ArrayElement,
  right: ArrayElement,
  segments: Segments,
  actions: ActionElement[],
): void => {
  const leftLen = left.length;
  const rightLen = right.length;
  const minLen = Math.min(leftLen, rightLen);

  for (let i = 0; i < minLen; i++) {
    const leftItem = left.get(i) as Element;
    const rightItem = right.get(i) as Element;

    if (leftItem.equals(rightItem)) continue;

    if (leftItem.primitive() !== rightItem.primitive()) {
      // structural type change at index i — reconstruct tail:
      // remove from end down to i (reverse order preserves index stability),
      // then batch-append right[i..] as a single ArrayElement (Overlay concat semantics)
      for (let j = leftLen - 1; j >= i; j--) {
        actions.push(createRemoveAction([...segments, j]));
      }
      const tail = new ArrayElement();
      for (let j = i; j < rightLen; j++) {
        tail.push(right.get(j));
      }
      actions.push(createUpdateAction(segments, tail));
      return;
    }

    diffElements(leftItem, rightItem, [...segments, i], actions);
  }

  // right is longer — batch all new items into a single ArrayElement update.
  // wrapping is required: applyUpdateAction uses deepmerge(array, array) for array targets,
  // so the update value must be an ArrayElement to trigger concat semantics.
  if (leftLen < rightLen) {
    const tail = new ArrayElement();
    for (let i = leftLen; i < rightLen; i++) {
      tail.push(right.get(i));
    }
    actions.push(createUpdateAction(segments, tail));
  }

  // left is longer — remove trailing items in reverse order for index stability
  for (let i = leftLen - 1; i >= rightLen; i--) {
    actions.push(createRemoveAction([...segments, i]));
  }
};

/**
 * Produces an {@link Overlay1Element} that, when applied to `leftElement`, yields `rightElement`.
 *
 * Known limitations:
 * - Identical documents produce an overlay with an empty `actions` array. Overlay 1.1.0 §3
 *   requires `actions` to be non-empty; callers should guard against the no-diff case.
 * - Root-level structural type change (e.g. object root → array root) throws {@link OverlayError}
 *   because Overlay has no mechanism to replace the root node.
 * - Array insert-at-position is not supported by Overlay 1.x; positional diffing cascades
 *   replaces and appends, which is always correct but may be verbose for large reorderings.
 * - Array items with a structural type change are handled via tail-reconstruct
 *   (remove tail + re-append from right), producing more actions than a minimal diff.
 * - The overlay carries no "before" value, so it cannot be reversed without the original document.
 * - Action `update` values reference elements from `rightElement` directly. Mutating `rightElement`
 *   after calling `diff` will affect the returned overlay.
 *
 * @public
 */
export const diff = (
  leftElement: Element,
  rightElement: Element,
  options: DiffOptions = {},
): Overlay1Element => {
  const overlayVersion = options.overlay ?? defaultDiffOptions.overlay;
  const infoTitle = options.info?.title ?? defaultDiffOptions.info.title;
  const infoVersion = options.info?.version ?? defaultDiffOptions.info.version;
  const infoDescription = options.info?.description;

  const actions: ActionElement[] = [];
  diffElements(leftElement, rightElement, [], actions);

  if (actions.length === 0 && options.onEmptyDiff === 'throw') {
    throw new OverlayError('Diff produced no actions: documents are identical');
  }

  const overlay = new Overlay1Element();
  overlay.overlay = new OverlayElement(overlayVersion);

  const info = new InfoElement();
  info.title = new StringElement(infoTitle);
  info.version = new StringElement(infoVersion);
  if (infoDescription !== undefined) {
    info.description = new StringElement(infoDescription);
  }
  overlay.info = info;

  if (options.extends !== undefined) {
    overlay.extends = new StringElement(options.extends);
  }

  overlay.actions = new ActionsElement(actions);

  return overlay;
};
