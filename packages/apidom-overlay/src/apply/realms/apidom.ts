import {
  Element,
  ObjectElement,
  ArrayElement,
  isObjectElement,
  isArrayElement,
  cloneDeep,
  ParseResultElement,
} from '@speclynx/apidom-datamodel';
import { deepmerge, toValue, type DeepMergeUserOptions } from '@speclynx/apidom-core';
import { evaluate, NormalizedPath } from '@speclynx/apidom-json-path';
import {
  type ActionElement,
  type Overlay1Element,
  isOverlay1Element,
} from '@speclynx/apidom-ns-overlay-1';

import OverlayError from '../../errors/OverlayError.ts';
import { validateAction, validateTargetNodes } from '../../validate.ts';
import TraceBuilder from '../trace/TraceBuilder.ts';
import type { OverlayTrace } from '../trace/types.ts';

/**
 * @public
 */
export interface ApplyOptions {
  readonly deepmerge?: DeepMergeUserOptions;
  readonly strict?: boolean;
  readonly immutable?: boolean;
  readonly trace?: OverlayTrace;
}

/**
 * Internal options that carry the tracer instance.
 */
interface InternalApplyOptions extends ApplyOptions {
  readonly tracer?: TraceBuilder;
}

const defaultApplyOptions: ApplyOptions = { immutable: true, strict: false };

/**
 * Merges caller options over the defaults. A partial options object leaves the
 * fields it omits undefined, which must still mean the documented defaults.
 * `immutable` is spelled out because it is the only default that is not falsy,
 * so a caller forwarding an undefined value must not end up mutating in place.
 */
const withDefaults = <T extends ApplyOptions>(options: T): T => ({
  ...defaultApplyOptions,
  ...options,
  immutable: options.immutable ?? defaultApplyOptions.immutable,
});

/**
 * Default customMerge that enforces Overlay spec type compatibility.
 * Throws OverlayError on incompatible type combinations.
 */
const overlayCustomMerge = (_keyElement: Element, options: DeepMergeUserOptions) => {
  return (target: ObjectElement | ArrayElement, source: ObjectElement | ArrayElement) => {
    const targetIsObject = isObjectElement(target);
    const sourceIsObject = isObjectElement(source);
    const targetIsArray = isArrayElement(target);
    const sourceIsArray = isArrayElement(source);

    if (targetIsObject !== sourceIsObject || targetIsArray !== sourceIsArray) {
      throw new OverlayError(
        `Incompatible types in overlay merge: cannot merge ` +
          `${targetIsObject ? 'object' : targetIsArray ? 'array' : 'primitive'} with ` +
          `${sourceIsObject ? 'object' : sourceIsArray ? 'array' : 'primitive'}`,
      );
    }

    return deepmerge(target, source, options);
  };
};

/**
 * Merges a value into a target node following Overlay spec semantics.
 */
const mergeValue = (
  targetElement: Element,
  sourceElement: Element,
  options: ApplyOptions = defaultApplyOptions,
): Element => {
  const targetIsObject = isObjectElement(targetElement);
  const targetIsArray = isArrayElement(targetElement);
  const sourceIsObject = isObjectElement(sourceElement);
  const sourceIsArray = isArrayElement(sourceElement);

  const clone = options.immutable;

  if ((targetIsObject && sourceIsObject) || (targetIsArray && sourceIsArray)) {
    const mergeOpts: DeepMergeUserOptions = {
      clone,
      customMerge: overlayCustomMerge,
      ...options.deepmerge,
    };
    return deepmerge(
      targetElement as ObjectElement | ArrayElement,
      sourceElement as ObjectElement | ArrayElement,
      mergeOpts,
    );
  }

  if (!targetIsObject && !targetIsArray && !sourceIsObject && !sourceIsArray) {
    return clone ? cloneDeep(sourceElement) : sourceElement;
  }

  throw new OverlayError(
    `Incompatible types in overlay merge: cannot merge ` +
      `${targetIsObject ? 'object' : targetIsArray ? 'array' : 'primitive'} with ` +
      `${sourceIsObject ? 'object' : sourceIsArray ? 'array' : 'primitive'}`,
  );
};

/**
 * Resolves a normalized path to its parent element and child key.
 */
const resolveParent = (
  normalizedPath: string,
  root: Element,
): { parent: Element | undefined; key: string | number } | null => {
  const selectors = NormalizedPath.to(normalizedPath);
  if (selectors.length === 0) return null; // root — no parent
  const key = selectors[selectors.length - 1];
  const parentPath = NormalizedPath.from(selectors.slice(0, -1));
  const [parent] = evaluate<Element>(root, parentPath);
  return { parent, key };
};

/**
 * Applies an update action to matched nodes.
 * @public
 */
export const applyUpdateAction = (
  normalizedPaths: string[],
  updateValue: Element,
  targetElement: Element,
  options: ApplyOptions = defaultApplyOptions,
): Element => {
  const opts = withDefaults(options);
  let result = opts.immutable ? cloneDeep(targetElement) : targetElement;

  for (const normalizedPath of normalizedPaths) {
    /**
     * Every matched node gets its own copy of the update value. deepmerge
     * shallow clones members, so the merged result shares key elements and
     * non-mergeable values with its source regardless of the clone option —
     * without this each target would alias every other target, and a copy
     * action would alias the copy source in the target document.
     */
    const clonedUpdateValue = cloneDeep(updateValue);
    const resolved = resolveParent(normalizedPath, result);

    if (resolved === null) {
      // targeting root
      result = mergeValue(result, clonedUpdateValue, opts);
      continue;
    }

    const { parent, key } = resolved;

    if (isObjectElement(parent)) {
      const current = parent.get(key as string);
      if (current !== undefined) {
        parent.set(key as string, mergeValue(current, clonedUpdateValue, opts));
      }
    } else if (isArrayElement(parent)) {
      const current = parent.get(key as number);
      if (current !== undefined) {
        (parent.content as Element[])[key as number] = mergeValue(current, clonedUpdateValue, opts);
      }
    }
  }

  return result;
};

/**
 * Applies a copy action to matched nodes.
 * @public
 */
export const applyCopyAction = (
  normalizedPaths: string[],
  copyExpression: string,
  targetElement: Element,
  options: ApplyOptions = defaultApplyOptions,
): Element => {
  const sourceMatches = evaluate<Element>(targetElement, copyExpression);

  if (sourceMatches.length === 0) {
    throw new OverlayError(`Copy source JSONPath "${copyExpression}" selected zero nodes`);
  }
  if (sourceMatches.length > 1) {
    throw new OverlayError(
      `Copy source JSONPath "${copyExpression}" must select a single node, but selected ${sourceMatches.length}`,
    );
  }

  /**
   * Snapshot the copy source. Matched targets are updated in document order and
   * the source may sit under one of them, so a live reference would let later
   * targets copy a source that an earlier target already modified.
   */
  const sourceValue = cloneDeep(sourceMatches[0]);
  return applyUpdateAction(normalizedPaths, sourceValue, targetElement, options);
};

/**
 * Applies a remove action to matched nodes.
 * @public
 */
export const applyRemoveAction = (
  normalizedPaths: string[],
  targetElement: Element,
  options: ApplyOptions = defaultApplyOptions,
): Element => {
  const opts = withDefaults(options);
  const result = opts.immutable ? cloneDeep(targetElement) : targetElement;
  // reverse document order so higher array indices are removed first (avoids index shifting)
  const sorted = [...normalizedPaths].reverse();

  for (const normalizedPath of sorted) {
    const resolved = resolveParent(normalizedPath, result);

    if (resolved === null) {
      throw new OverlayError('Cannot remove the root node');
    }

    const { parent, key } = resolved;

    if (isObjectElement(parent)) {
      parent.remove(key as string);
    } else if (isArrayElement(parent)) {
      (parent.content as Element[]).splice(key as number, 1);
    }
  }

  return result;
};

/**
 * Applies a single overlay action to a target element.
 *
 * Immutable by default. The target is cloned once up front and the action is
 * applied to the clone, so the returned element is always independent of the
 * input, including when the action changes nothing. Pass `immutable: false` to
 * apply the action in place.
 *
 * @public
 */
export const applyAction = (
  actionElement: ActionElement,
  targetElement: Element,
  options: ApplyOptions = defaultApplyOptions,
): Element => {
  const opts = withDefaults(options as InternalApplyOptions);
  const tracer = opts.tracer ?? (opts.trace ? new TraceBuilder(opts.trace) : undefined);
  const actionValidation = validateAction(actionElement);
  if (!actionValidation.valid) throw actionValidation.error!;

  const targetExpression = toValue(actionElement.target) as string;

  const matches: Element[] = [];
  const normalizedPaths: string[] = [];
  evaluate<Element>(targetElement, targetExpression, {
    callback: (value, normalizedPath) => {
      matches.push(value as Element);
      normalizedPaths.push(normalizedPath);
    },
  });

  if (matches.length === 0) {
    if (opts.strict) {
      const error = new OverlayError(
        `Action target "${targetExpression}" matched zero nodes (strict mode)`,
        { action: actionElement },
      );

      tracer?.action({
        target: targetExpression,
        type: 'noop',
        matchCount: 0,
        normalizedPaths: [],
        success: false,
        error,
      });

      throw error;
    }
    tracer?.action({
      target: targetExpression,
      type: 'noop',
      matchCount: 0,
      normalizedPaths: [],
    });
    return opts.immutable ? cloneDeep(targetElement) : targetElement;
  }

  // clone once, then apply the action mutably to the clone
  const workingElement = opts.immutable ? cloneDeep(targetElement) : targetElement;
  const mutatingOptions: InternalApplyOptions = { ...opts, immutable: false };

  try {
    // remove action
    const removeValue = actionElement.removeField;
    if (removeValue !== undefined && toValue(removeValue) === true) {
      const result = applyRemoveAction(normalizedPaths, workingElement, mutatingOptions);
      tracer?.action({
        target: targetExpression,
        type: 'remove',
        matchCount: matches.length,
        normalizedPaths,
      });
      return result;
    }

    // update action
    if (actionElement.update !== undefined) {
      const nodesValidation = validateTargetNodes(matches);
      if (!nodesValidation.valid) throw nodesValidation.error!;

      const result = applyUpdateAction(
        normalizedPaths,
        actionElement.update as Element,
        workingElement,
        mutatingOptions,
      );

      tracer?.action({
        target: targetExpression,
        type: 'update',
        matchCount: matches.length,
        normalizedPaths,
      });

      return result;
    }

    // copy action
    if (actionElement.copy !== undefined) {
      const nodesValidation = validateTargetNodes(matches);
      if (!nodesValidation.valid) throw nodesValidation.error!;
      const copyExpression = toValue(actionElement.copy) as string;
      const result = applyCopyAction(
        normalizedPaths,
        copyExpression,
        workingElement,
        mutatingOptions,
      );

      tracer?.action({
        target: targetExpression,
        type: 'copy',
        matchCount: matches.length,
        normalizedPaths,
      });

      return result;
    }

    tracer?.action({
      target: targetExpression,
      type: 'noop',
      matchCount: matches.length,
      normalizedPaths,
    });

    return workingElement;
  } catch (error: unknown) {
    // enrich OverlayError with action context, preserving original stack
    if (error instanceof OverlayError && !error.action) {
      error.action = actionElement;
    }

    tracer?.action({
      target: targetExpression,
      type: 'noop',
      matchCount: matches.length,
      normalizedPaths,
      success: false,
      error: error instanceof OverlayError ? error : undefined,
    });

    throw error;
  }
};

/**
 * Applies an entire overlay document to a target element.
 *
 * Immutable by default. The target is cloned once up front and all actions are
 * applied to the clone sequentially, so the returned element is always
 * independent of the input, including when no action changes anything. Pass
 * `immutable: false` to apply the actions in place.
 *
 * When the target is a `ParseResultElement`, that parse result is returned with
 * its result element replaced by the new tree, including when no action changed
 * anything. The original result element is never mutated, but it is detached
 * from the parse result. The immutable contract covers the result element, not
 * the parse result wrapper.
 *
 * @public
 */
export const applyOverlay = <T extends Element | ParseResultElement>(
  overlayElement: Overlay1Element | ParseResultElement,
  targetElement: T,
  options: ApplyOptions = defaultApplyOptions,
): T => {
  const overlay =
    overlayElement instanceof ParseResultElement ? overlayElement.api : overlayElement;

  if (!isOverlay1Element(overlay)) {
    throw new OverlayError('First argument must be an Overlay 1.x document');
  }

  let target: Element;
  if (targetElement instanceof ParseResultElement) {
    if (targetElement.result === undefined) {
      throw new OverlayError('Target ParseResultElement contains no result element');
    }
    target = targetElement.result;
  } else {
    target = targetElement;
  }

  const opts = withDefaults(options as InternalApplyOptions);
  const tracer = opts.trace ? new TraceBuilder(opts.trace) : undefined;
  const internalOptions: InternalApplyOptions = tracer ? { ...opts, tracer } : opts;
  // clone once, then apply the actions mutably to the clone
  const mutatingOptions: InternalApplyOptions = { ...internalOptions, immutable: false };

  target = opts.immutable ? cloneDeep(target) : target;

  if (isArrayElement(overlay.actions)) {
    for (const action of overlay.actions) {
      target = applyAction(action as ActionElement, target, mutatingOptions);
    }
  }

  if (targetElement instanceof ParseResultElement) {
    if (target !== targetElement.result) {
      targetElement.replaceResult(target);
    }
    return targetElement;
  }

  return target as T;
};
