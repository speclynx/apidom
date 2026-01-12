/**
 * SPDX-FileCopyrightText: Copyright (c) GraphQL Contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import { isPromise } from 'ramda-adjunct';

import { Path } from './Path.ts';
import type { VisitorFn, VisitorResult } from './Path.ts';
import { getNodeType, isNode, cloneNode, mutateNode, getVisitFn, getNodeKeys } from './visitors.ts';

/**
 * Options for the traverse function.
 * @public
 */
export interface TraverseOptions<TNode> {
  /**
   * Map of node types to their traversable keys, or a function that returns keys for a node.
   * Defaults to predicate-based detection for ApiDOM elements.
   */
  keyMap?: Record<string, readonly string[]> | ((node: TNode) => readonly string[]) | null;
  /**
   * State object to assign to visitor during traversal.
   */
  state?: Record<string, unknown>;
  /**
   * Function to get the type of a node. Defaults to `node.type`.
   */
  nodeTypeGetter?: (node: TNode) => string | undefined;
  /**
   * Predicate to check if a value is a valid node.
   */
  nodePredicate?: (value: unknown) => value is TNode;
  /**
   * Function to clone a node. Used when edits are made in immutable mode.
   */
  nodeCloneFn?: (node: TNode) => TNode;
  /**
   * Whether to detect and skip cycles. Defaults to true.
   */
  detectCycles?: boolean;
  /**
   * If true, edits modify the original tree in place.
   * If false (default), creates a new tree with changes applied.
   */
  mutable?: boolean;
  /**
   * Custom function for applying mutations in mutable mode.
   * Handles ApiDOM structures (MemberElement, arrays) by default.
   */
  mutationFn?: (parent: TNode, key: PropertyKey, value: TNode | null) => void;
}

// =============================================================================
// Internal types for generator
// =============================================================================

interface VisitorCall<TNode> {
  visitFn: VisitorFn<TNode>;
  path: Path<TNode>;
  isLeaving: boolean;
}

interface TraversalState<TNode> {
  inArray: boolean;
  index: number;
  keys: readonly PropertyKey[] | TNode[];
  edits: Array<[PropertyKey, TNode | null]>;
  parentPath: Path<TNode> | null;
  prev: TraversalState<TNode> | undefined;
}

// =============================================================================
// Core generator
// =============================================================================

function* traverseGenerator<TNode>(
  root: TNode,
  visitor: object,
  options: Required<TraverseOptions<TNode>>,
): Generator<VisitorCall<TNode>, TNode, VisitorResult<TNode>> {
  const {
    keyMap,
    state,
    nodeTypeGetter,
    nodePredicate,
    nodeCloneFn,
    detectCycles,
    mutable,
    mutationFn,
  } = options;
  const keyMapIsFunction = typeof keyMap === 'function';

  let stack: TraversalState<TNode> | undefined;
  let inArray = Array.isArray(root);
  let keys: readonly PropertyKey[] | TNode[] = [root];
  let index = -1;
  let parent: TNode | undefined;
  let edits: Array<[PropertyKey, TNode | null]> = [];
  let node: TNode = root;
  let currentPath: Path<TNode> | null = null;
  let parentPath: Path<TNode> | null = null;
  const ancestors: TNode[] = [];

  do {
    index += 1;
    const isLeaving = index === keys.length;
    let key: PropertyKey | undefined;
    const isEdited = isLeaving && edits.length !== 0;

    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : (currentPath as Path<TNode> | null)?.key;
      node = parent as TNode;
      parent = ancestors.pop();
      parentPath = (currentPath as Path<TNode> | null)?.parentPath?.parentPath ?? null;

      if (isEdited) {
        if (mutable) {
          // Mutable mode: modify in place using mutationFn
          for (const [editKey, editValue] of edits) {
            mutationFn(node, editKey, editValue);
          }
        } else {
          // Immutable mode: clone then modify
          if (inArray) {
            node = (node as unknown as TNode[]).slice() as unknown as TNode;
            let editOffset = 0;
            for (const [editKey, editValue] of edits) {
              const arrayKey = (editKey as number) - editOffset;
              if (editValue === null) {
                (node as unknown as TNode[]).splice(arrayKey, 1);
                editOffset += 1;
              } else {
                (node as unknown as TNode[])[arrayKey] = editValue;
              }
            }
          } else {
            node = nodeCloneFn(node);
            for (const [editKey, editValue] of edits) {
              (node as Record<PropertyKey, unknown>)[editKey] = editValue;
            }
          }
        }
      }

      if (stack !== undefined) {
        // Restore parent's state
        index = stack.index;
        keys = stack.keys;
        edits = stack.edits;
        const parentInArray = stack.inArray;
        parentPath = stack.parentPath;
        stack = stack.prev;

        // Push the edited node to parent's edits for propagation up the tree
        // Use the restored index to get the correct key for this node in its parent
        // Only needed in immutable mode - mutable mode modifies in place
        if (isEdited && !mutable) {
          const editKey = parentInArray ? index : (keys[index] as PropertyKey);
          edits.push([editKey, node]);
        }
        inArray = parentInArray;
      }
    } else if (parent !== undefined) {
      key = inArray ? index : (keys[index] as PropertyKey);
      node = (parent as Record<PropertyKey, TNode>)[key];
      if (node === undefined) {
        continue;
      }
    }

    if (!Array.isArray(node)) {
      if (!nodePredicate(node)) {
        throw new ApiDOMStructuredError(`Invalid AST Node: ${String(node)}`, { node });
      }

      // Cycle detection
      if (detectCycles && ancestors.includes(node)) {
        continue;
      }

      // Always create Path for the current node (needed for parentPath chain)
      currentPath = new Path<TNode>(node, parent, parentPath, key, inArray);

      const visitFn = getVisitFn<TNode>(visitor, nodeTypeGetter(node), isLeaving);

      if (visitFn) {
        // Assign state to visitor
        for (const [stateKey, stateValue] of Object.entries(state)) {
          (visitor as Record<string, unknown>)[stateKey] = stateValue;
        }

        // Yield to caller to execute visitor
        const result: VisitorResult<TNode> = yield {
          visitFn,
          path: currentPath,
          isLeaving,
        };

        // Handle path-based control flow
        if (currentPath.shouldStop) {
          break;
        }

        if (currentPath.shouldSkip) {
          if (!isLeaving) {
            continue;
          }
        }

        if (currentPath.removed) {
          edits.push([key!, null]);
          if (!isLeaving) {
            continue;
          }
        } else if (currentPath._wasReplaced()) {
          const replacement = currentPath._getReplacementNode()!;
          edits.push([key!, replacement]);
          if (!isLeaving) {
            if (nodePredicate(replacement)) {
              node = replacement;
            } else {
              continue;
            }
          }
        } else if (result !== undefined) {
          // Support return value replacement for backwards compatibility
          edits.push([key!, result as TNode]);
          if (!isLeaving) {
            if (nodePredicate(result)) {
              node = result as TNode;
            } else {
              continue;
            }
          }
        }

        // Mark path as stale after processing - warns if used from child visitors
        currentPath._markStale();
      }
    }

    if (!isLeaving) {
      stack = { inArray, index, keys, edits, parentPath, prev: stack };
      inArray = Array.isArray(node);
      if (inArray) {
        keys = node as unknown as TNode[];
      } else if (keyMapIsFunction) {
        keys = keyMap(node);
      } else {
        const nodeType = nodeTypeGetter(node);
        keys =
          nodeType !== undefined
            ? ((keyMap as Record<string, readonly string[]>)[nodeType] ?? [])
            : [];
      }
      index = -1;
      edits = [];
      if (parent !== undefined) {
        ancestors.push(parent);
      }
      parent = node;
      parentPath = currentPath;
    }
  } while (stack !== undefined);

  if (edits.length !== 0) {
    return edits.at(-1)![1] as TNode;
  }

  return root;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * traverse() walks through a tree using preorder depth-first traversal, calling
 * the visitor's enter function at each node, and calling leave after visiting
 * that node and all its children.
 *
 * Visitors receive a Path object with:
 * - `path.node` - the current node
 * - `path.parent` - the parent node
 * - `path.key` - key in parent
 * - `path.parentPath` - parent Path (linked list structure)
 * - `path.replaceWith(node)` - replace current node
 * - `path.remove()` - remove current node
 * - `path.skip()` - skip children (enter only)
 * - `path.stop()` - stop all traversal
 *
 * When editing, the original tree is not modified. A new version with changes
 * applied is returned.
 *
 * @example
 * ```typescript
 * const edited = traverse(ast, {
 *   enter(path) {
 *     console.log(path.node);
 *     if (shouldSkip) path.skip();
 *     if (shouldReplace) path.replaceWith(newNode);
 *   },
 *   leave(path) {
 *     if (shouldRemove) path.remove();
 *   }
 * });
 * ```
 *
 * Visitor patterns supported:
 * 1. `{ Kind(path) {} }` - enter specific node type
 * 2. `{ Kind: { enter(path) {}, leave(path) {} } }` - enter/leave specific type
 * 3. `{ enter(path) {}, leave(path) {} }` - enter/leave any node
 * 4. `{ enter: { Kind(path) {} }, leave: { Kind(path) {} } }` - parallel style
 *
 * @public
 */
export const traverse = <TNode>(
  root: TNode,
  visitor: object,
  options: TraverseOptions<TNode> = {},
): TNode => {
  const resolvedOptions: Required<TraverseOptions<TNode>> = {
    keyMap: options.keyMap ?? (getNodeKeys as (node: TNode) => readonly string[]),
    state: options.state ?? {},
    nodeTypeGetter: options.nodeTypeGetter ?? (getNodeType as (node: TNode) => string | undefined),
    nodePredicate: options.nodePredicate ?? (isNode as (value: unknown) => value is TNode),
    nodeCloneFn: options.nodeCloneFn ?? (cloneNode as (node: TNode) => TNode),
    detectCycles: options.detectCycles ?? true,
    mutable: options.mutable ?? false,
    mutationFn: options.mutationFn ?? mutateNode,
  };

  const generator = traverseGenerator(root, visitor, resolvedOptions);
  let step = generator.next();

  while (!step.done) {
    const call = step.value;
    const result = call.visitFn.call(visitor, call.path);

    if (isPromise(result)) {
      throw new ApiDOMStructuredError('Async visitor not supported in sync mode', {
        visitor,
        visitFn: call.visitFn,
      });
    }

    step = generator.next(result);
  }

  return step.value;
};

/**
 * Async version of traverse().
 * @public
 */
export const traverseAsync = async <TNode>(
  root: TNode,
  visitor: object,
  options: TraverseOptions<TNode> = {},
): Promise<TNode> => {
  const resolvedOptions: Required<TraverseOptions<TNode>> = {
    keyMap: options.keyMap ?? (getNodeKeys as (node: TNode) => readonly string[]),
    state: options.state ?? {},
    nodeTypeGetter: options.nodeTypeGetter ?? (getNodeType as (node: TNode) => string | undefined),
    nodePredicate: options.nodePredicate ?? (isNode as (value: unknown) => value is TNode),
    nodeCloneFn: options.nodeCloneFn ?? (cloneNode as (node: TNode) => TNode),
    detectCycles: options.detectCycles ?? true,
    mutable: options.mutable ?? false,
    mutationFn: options.mutationFn ?? mutateNode,
  };

  const generator = traverseGenerator(root, visitor, resolvedOptions);
  let step = generator.next();

  while (!step.done) {
    const call = step.value;
    const result = await call.visitFn.call(visitor, call.path);

    step = generator.next(result);
  }

  return step.value;
};

// Attach async version for promisify compatibility
(traverse as unknown as Record<symbol, unknown>)[Symbol.for('nodejs.util.promisify.custom')] =
  traverseAsync;
