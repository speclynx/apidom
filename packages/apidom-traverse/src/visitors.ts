import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import {
  isElement,
  isMemberElement,
  isArrayElement,
  isObjectElement,
  cloneShallow,
  type Element,
} from '@speclynx/apidom-datamodel';
import { isPromise } from 'ramda-adjunct';

import { Path } from './Path.ts';
import type { VisitorFn, VisitorResult } from './Path.ts';

/**
 * Enter/leave visitor structure for a specific node type.
 * @public
 */
export interface NodeVisitor<TNode, TVisitor = unknown> {
  enter?: VisitorFn<TNode, TVisitor>;
  leave?: VisitorFn<TNode, TVisitor>;
}

// =============================================================================
// Default implementations for ApiDOM
// =============================================================================

/**
 * Default node type getter - reads the `element` property and converts to Element class name.
 * E.g., "string" -\> "StringElement", "openApi3_1" -\> "OpenApi3_1Element"
 * @public
 */
export const getNodeType = <TNode>(node: TNode): string => {
  const type = (node as Element)?.element;
  if (type === undefined || type === 'element') return 'Element';
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}Element`;
};

/**
 * Alternative node type getter using primitive type.
 * Returns the base element class name based on the node's primitive type.
 * E.g., ContactElement (primitive='object') -\> "ObjectElement"
 *
 * Use this with `nodeTypeGetter` option when you want polymorphic behavior
 * where specific elements fall back to their primitive type handlers.
 * @public
 */
export const getNodePrimitiveType = <TNode>(node: TNode): string => {
  const type = (node as Element).primitive();
  if (type === undefined || type === 'element') return 'Element';
  return `${type.charAt(0).toUpperCase()}${type.slice(1)}Element`;
};

/**
 * Default node predicate - checks if value is an ApiDOM Element.
 * @public
 */
export const isNode = <TNode>(value: unknown): value is TNode => isElement(value);

/**
 * Default node clone function - creates a shallow clone of ApiDOM Elements.
 * Uses cloneShallow from apidom-datamodel for proper handling of meta/attributes.
 * @public
 */
export const cloneNode = <TNode>(node: TNode): TNode => cloneShallow(node as Element) as TNode;

/**
 * Default mutation function that handles ApiDOM structures.
 * - MemberElement: sets parent.value
 * - Arrays: sets parent[key]
 * - Objects: sets parent[key] or deletes if null
 * @public
 */
export const mutateNode = <TNode>(parent: TNode, key: PropertyKey, value: TNode | null): void => {
  if (isMemberElement(parent)) {
    // MemberElement stores value in .value property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (parent as any).value = value;
  } else if (Array.isArray(parent)) {
    if (value === null) {
      // For arrays, set to undefined (caller handles cleanup)
      parent[key as number] = undefined as unknown as TNode;
    } else {
      parent[key as number] = value;
    }
  } else if (value === null) {
    delete (parent as Record<PropertyKey, unknown>)[key];
  } else {
    (parent as Record<PropertyKey, unknown>)[key] = value;
  }
};

/**
 * Default function to get traversable keys for a node.
 * Uses predicates to handle all ApiDOM element types automatically.
 * @public
 */
export const getNodeKeys = <TNode>(node: TNode): readonly string[] => {
  if (isMemberElement(node)) return ['key', 'value'];
  if (isArrayElement(node) || isObjectElement(node)) return ['content'];
  return [];
};

// =============================================================================
// Visitor function resolution
// =============================================================================

/**
 * Lookup by type with pipe-separated key support ("TypeA|TypeB").
 * Optimized: no array allocations, uses indexOf + boundary checks.
 */
const lookup = (record: Record<string, unknown>, type: string): unknown => {
  // Fast path: exact match
  if (record[type] !== undefined) return record[type];

  // Slow path: check pipe-separated keys
  const len = type.length;
  for (const key in record) {
    // Skip keys without pipe (most common case)
    if (!key.includes('|')) continue;

    const idx = key.indexOf(type);
    if (idx === -1) continue;

    // Verify it's a complete segment (bounded by | or string edges)
    const before = idx === 0 || key[idx - 1] === '|';
    const after = idx + len === key.length || key[idx + len] === '|';
    if (before && after) return record[key];
  }

  return undefined;
};

/**
 * Gets the appropriate visitor function for a node type and phase.
 * Supports pipe-separated type keys like "TypeA|TypeB".
 * @public
 */
export const getVisitFn = <TNode>(
  visitor: object,
  type: string | undefined,
  isLeaving: boolean,
): VisitorFn<TNode> | null => {
  if (type === undefined) return null;

  const visitorRecord = visitor as Record<string, unknown>;
  const phase = isLeaving ? 'leave' : 'enter';

  // Pattern 1: { Type() {} } - shorthand for enter only
  const typeVisitor = lookup(visitorRecord, type);
  if (!isLeaving && typeof typeVisitor === 'function') {
    return typeVisitor as VisitorFn<TNode>;
  }

  // Pattern 2: { Type: { enter, leave } }
  if (typeVisitor != null) {
    const phaseVisitor = (typeVisitor as NodeVisitor<TNode>)[phase];
    if (typeof phaseVisitor === 'function') {
      return phaseVisitor;
    }
  }

  // Pattern 3: { enter() {}, leave() {} }
  const genericVisitor = visitorRecord[phase];
  if (typeof genericVisitor === 'function') {
    return genericVisitor as VisitorFn<TNode>;
  }

  // Pattern 4: { enter: { Type() {} } }
  if (genericVisitor != null) {
    const typeInPhase = lookup(genericVisitor as Record<string, unknown>, type);
    if (typeof typeInPhase === 'function') {
      return typeInPhase as VisitorFn<TNode>;
    }
  }

  return null;
};

// =============================================================================
// Visitor merging
// =============================================================================

/**
 * Options for mergeVisitors.
 * @public
 */
export interface MergeVisitorsOptions<TNode> {
  visitFnGetter?: typeof getVisitFn;
  nodeTypeGetter?: (node: TNode) => string | undefined;
  exposeEdits?: boolean;
}

/**
 * Sync version of merged visitor.
 * @public
 */
export interface MergedVisitor<TNode> {
  enter?: VisitorFn<TNode>;
  leave?: VisitorFn<TNode>;
  [key: string]: VisitorFn<TNode> | NodeVisitor<TNode> | undefined;
}

/**
 * Async version of merged visitor.
 * @public
 */
export interface MergedVisitorAsync<TNode> {
  enter?: VisitorFn<TNode>;
  leave?: VisitorFn<TNode>;
  [key: string]: VisitorFn<TNode> | NodeVisitor<TNode> | undefined;
}

/**
 * Creates a new visitor instance which delegates to many visitors to run in
 * parallel. Each visitor will be visited for each node before moving on.
 *
 * If a prior visitor edits a node, no following visitors will see that node.
 * `exposeEdits=true` can be used to expose the edited node from the previous visitors.
 * @public
 */
export const mergeVisitors = <TNode>(
  visitors: object[],
  options: MergeVisitorsOptions<TNode> = {},
): MergedVisitor<TNode> => {
  const {
    visitFnGetter = getVisitFn,
    nodeTypeGetter = getNodeType as (node: TNode) => string | undefined,
    exposeEdits = false,
  } = options;

  // Internal symbols for tracking visitor state
  const internalSkipSymbol = Symbol('internal-skip');
  const breakSymbol = Symbol('break');
  // Tracks which visitors should be skipped for current subtree or permanently stopped
  const skipping: (symbol | TNode)[] = new Array(visitors.length).fill(internalSkipSymbol);

  return {
    enter(path: Path<TNode>): VisitorResult<TNode> {
      let currentNode = path.node;
      let hasChanged = false;

      for (let i = 0; i < visitors.length; i += 1) {
        if (skipping[i] === internalSkipSymbol) {
          const visitFn = visitFnGetter<TNode>(visitors[i], nodeTypeGetter(currentNode), false);

          if (typeof visitFn === 'function') {
            // Create a proxy path that tracks changes per-visitor
            const proxyPath = createPathProxy(path, currentNode);
            const result = visitFn.call(visitors[i], proxyPath);

            // Check if the visitor is async
            if (isPromise(result)) {
              throw new ApiDOMStructuredError('Async visitor not supported in sync mode', {
                visitor: visitors[i],
                visitFn,
              });
            }

            // Handle path-based control flow
            if (proxyPath.shouldStop) {
              skipping[i] = breakSymbol;
              break;
            }

            if (proxyPath.shouldSkip) {
              skipping[i] = currentNode;
            }

            if (proxyPath.removed) {
              path.remove();
              return undefined;
            }

            if (proxyPath._wasReplaced()) {
              const replacement = proxyPath._getReplacementNode()!;
              if (exposeEdits) {
                currentNode = replacement;
                hasChanged = true;
              } else {
                path.replaceWith(replacement);
                return replacement;
              }
            } else if (result !== undefined) {
              // Support return value replacement for backwards compatibility
              if (exposeEdits) {
                currentNode = result as TNode;
                hasChanged = true;
              } else {
                path.replaceWith(result as TNode);
                return result;
              }
            }
          }
        }
      }

      if (hasChanged) {
        path.replaceWith(currentNode);
        return currentNode;
      }

      return undefined;
    },

    leave(path: Path<TNode>): VisitorResult<TNode> {
      const currentNode = path.node;

      for (let i = 0; i < visitors.length; i += 1) {
        if (skipping[i] === internalSkipSymbol) {
          const visitFn = visitFnGetter<TNode>(visitors[i], nodeTypeGetter(currentNode), true);

          if (typeof visitFn === 'function') {
            // Create a proxy path for leave phase
            const proxyPath = createPathProxy(path, currentNode);
            const result = visitFn.call(visitors[i], proxyPath);

            // Check if the visitor is async
            if (isPromise(result)) {
              throw new ApiDOMStructuredError('Async visitor not supported in sync mode', {
                visitor: visitors[i],
                visitFn,
              });
            }

            // Handle path-based control flow
            if (proxyPath.shouldStop) {
              skipping[i] = breakSymbol;
              break;
            }

            if (proxyPath.removed) {
              path.remove();
              return undefined;
            }

            if (proxyPath._wasReplaced()) {
              const replacement = proxyPath._getReplacementNode()!;
              path.replaceWith(replacement);
              return replacement;
            } else if (result !== undefined) {
              path.replaceWith(result as TNode);
              return result;
            }
          }
        } else if (skipping[i] === currentNode) {
          // Reset skip state when leaving the node that was skipped
          skipping[i] = internalSkipSymbol;
        }
      }

      return undefined;
    },
  };
};

/**
 * Async version of mergeVisitors.
 * @public
 */
export const mergeVisitorsAsync = <TNode>(
  visitors: object[],
  options: MergeVisitorsOptions<TNode> = {},
): MergedVisitorAsync<TNode> => {
  const {
    visitFnGetter = getVisitFn,
    nodeTypeGetter = getNodeType as (node: TNode) => string | undefined,
    exposeEdits = false,
  } = options;

  const internalSkipSymbol = Symbol('internal-skip');
  const breakSymbol = Symbol('break');
  const skipping: (symbol | TNode)[] = new Array(visitors.length).fill(internalSkipSymbol);

  return {
    async enter(path: Path<TNode>): Promise<void | TNode | undefined> {
      let currentNode = path.node;
      let hasChanged = false;

      for (let i = 0; i < visitors.length; i += 1) {
        if (skipping[i] === internalSkipSymbol) {
          const visitFn = visitFnGetter<TNode>(visitors[i], nodeTypeGetter(currentNode), false);

          if (typeof visitFn === 'function') {
            const proxyPath = createPathProxy(path, currentNode);
            const result = await visitFn.call(visitors[i], proxyPath);

            if (proxyPath.shouldStop) {
              skipping[i] = breakSymbol;
              break;
            }

            if (proxyPath.shouldSkip) {
              skipping[i] = currentNode;
            }

            if (proxyPath.removed) {
              path.remove();
              return undefined;
            }

            if (proxyPath._wasReplaced()) {
              const replacement = proxyPath._getReplacementNode()!;
              if (exposeEdits) {
                currentNode = replacement;
                hasChanged = true;
              } else {
                path.replaceWith(replacement);
                return replacement;
              }
            } else if (result !== undefined) {
              if (exposeEdits) {
                currentNode = result as TNode;
                hasChanged = true;
              } else {
                path.replaceWith(result as TNode);
                return result;
              }
            }
          }
        }
      }

      if (hasChanged) {
        path.replaceWith(currentNode);
        return currentNode;
      }

      return undefined;
    },

    async leave(path: Path<TNode>): Promise<void | TNode | undefined> {
      const currentNode = path.node;

      for (let i = 0; i < visitors.length; i += 1) {
        if (skipping[i] === internalSkipSymbol) {
          const visitFn = visitFnGetter<TNode>(visitors[i], nodeTypeGetter(currentNode), true);

          if (typeof visitFn === 'function') {
            const proxyPath = createPathProxy(path, currentNode);

            const result = await visitFn.call(visitors[i], proxyPath);

            if (proxyPath.shouldStop) {
              skipping[i] = breakSymbol;
              break;
            }

            if (proxyPath.removed) {
              path.remove();
              return undefined;
            }

            if (proxyPath._wasReplaced()) {
              const replacement = proxyPath._getReplacementNode()!;
              path.replaceWith(replacement);
              return replacement;
            } else if (result !== undefined) {
              path.replaceWith(result as TNode);
              return result;
            }
          }
        } else if (skipping[i] === currentNode) {
          skipping[i] = internalSkipSymbol;
        }
      }

      return undefined;
    },
  };
};

// Attach async version for promisify compatibility
(mergeVisitors as unknown as Record<symbol, unknown>)[Symbol.for('nodejs.util.promisify.custom')] =
  mergeVisitorsAsync;

/**
 * Creates a proxy Path that allows individual visitors to track their own
 * control flow state without affecting the original Path.
 * @internal
 */
function createPathProxy<TNode>(originalPath: Path<TNode>, currentNode: TNode): Path<TNode> {
  return new Path<TNode>(
    currentNode,
    originalPath.parent,
    originalPath.parentPath,
    originalPath.key,
    originalPath.inList,
  );
}
