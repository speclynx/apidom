import type { Element } from '@speclynx/apidom-datamodel';

/**
 * Possible return values from a visitor function.
 * @public
 */
export type VisitorResult<TNode> = void | undefined | TNode | Promise<void | undefined | TNode>;

/**
 * Visitor function signature - receives a Path object.
 * @public
 */
export type VisitorFn<TNode, TVisitor = unknown> = (
  this: TVisitor,
  path: Path<TNode>,
) => VisitorResult<TNode>;

/**
 * Path represents a node's position in the tree during traversal.
 * Inspired by Babel's NodePath API.
 * @public
 */
export class Path<TNode = Element> {
  /**
   * The current AST node.
   */
  public node: TNode;

  /**
   * The key of this node in its parent.
   * `undefined` for the root node.
   */
  public readonly key: PropertyKey | undefined;

  /**
   * The index if this node is in an array.
   * Same as `key` when parent property is an array, `undefined` otherwise.
   */
  public readonly index: number | undefined;

  /**
   * The parent node.
   * `undefined` for the root node.
   */
  public readonly parent: TNode | undefined;

  /**
   * The parent Path.
   * `null` for the root node.
   */
  public readonly parentPath: Path<TNode> | null;

  /**
   * Whether this node is inside an array in the parent.
   */
  public readonly inList: boolean;

  /**
   * Internal state for traversal control.
   */
  #shouldSkip: boolean = false;
  #shouldStop: boolean = false;
  #removed: boolean = false;
  #replaced: boolean = false;
  #replacementNode: TNode | undefined;
  #stale: boolean = false;

  constructor(
    node: TNode,
    parent: TNode | undefined,
    parentPath: Path<TNode> | null,
    key: PropertyKey | undefined,
    inList: boolean,
  ) {
    this.node = node;
    this.parent = parent;
    this.parentPath = parentPath;
    this.key = key;
    this.index = inList && typeof key === 'number' ? key : undefined;
    this.inList = inList;
  }

  // ===========================================================================
  // Traversal state
  // ===========================================================================

  /**
   * Whether skip() was called on this path.
   */
  get shouldSkip(): boolean {
    return this.#shouldSkip;
  }

  /**
   * Whether stop() was called on this path.
   */
  get shouldStop(): boolean {
    return this.#shouldStop;
  }

  /**
   * Whether this node was removed.
   */
  get removed(): boolean {
    return this.#removed;
  }

  // ===========================================================================
  // Ancestry
  // ===========================================================================

  /**
   * Returns true if this is the root path.
   */
  isRoot(): boolean {
    return this.parentPath === null;
  }

  /**
   * Get the depth of this path (0 for root).
   */
  get depth(): number {
    let depth = 0;
    let current: Path<TNode> | null = this.parentPath;
    while (current !== null) {
      depth += 1;
      current = current.parentPath;
    }
    return depth;
  }

  /**
   * Get all ancestor paths from immediate parent to root.
   */
  getAncestry(): Path<TNode>[] {
    const ancestry: Path<TNode>[] = [];
    let current: Path<TNode> | null = this.parentPath;
    while (current !== null) {
      ancestry.push(current);
      current = current.parentPath;
    }
    return ancestry;
  }

  /**
   * Get all ancestor nodes from immediate parent to root.
   */
  getAncestorNodes(): TNode[] {
    return this.getAncestry().map((p) => p.node);
  }

  /**
   * Get the path from root as an array of keys.
   */
  getPathKeys(): PropertyKey[] {
    const keys: PropertyKey[] = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Path<TNode> | null = this;
    while (current !== null && current.key !== undefined) {
      keys.unshift(current.key);
      current = current.parentPath;
    }
    return keys;
  }

  /**
   * Find the closest ancestor path that satisfies the predicate.
   */
  findParent(predicate: (path: Path<TNode>) => boolean): Path<TNode> | null {
    let current: Path<TNode> | null = this.parentPath;
    while (current !== null) {
      if (predicate(current)) {
        return current;
      }
      current = current.parentPath;
    }
    return null;
  }

  /**
   * Find the closest path (including this one) that satisfies the predicate.
   */
  find(predicate: (path: Path<TNode>) => boolean): Path<TNode> | null {
    if (predicate(this)) {
      return this;
    }
    return this.findParent(predicate);
  }

  // ===========================================================================
  // Nested traversal
  // ===========================================================================

  /**
   * Traverse into the current node with a new visitor.
   * Populated by the traversal module to avoid circular imports.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare traverse: (visitor: any, options?: any) => TNode;

  /**
   * Async version of traverse.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare traverseAsync: (visitor: any, options?: any) => Promise<TNode>;

  // ===========================================================================
  // Traversal control
  // ===========================================================================

  /**
   * Skip traversing the children of this node.
   */
  skip(): void {
    this.#shouldSkip = true;
  }

  /**
   * Stop all traversal completely.
   */
  stop(): void {
    this.#shouldStop = true;
  }

  // ===========================================================================
  // Modification
  // ===========================================================================

  /**
   * Replace this node with a new node.
   */
  replaceWith(replacement: TNode): void {
    if (this.#stale) {
      console.warn(
        'Warning: replaceWith() called on a stale Path. ' +
          'This path belongs to a node whose visit has already completed. ' +
          'The replacement will have no effect. ' +
          "To replace a parent node, do so from the parent's own visitor.",
      );
    }
    this.#replaced = true;
    this.#replacementNode = replacement;
    this.node = replacement;
  }

  /**
   * Remove this node from the tree.
   */
  remove(): void {
    if (this.#stale) {
      console.warn(
        'Warning: remove() called on a stale Path. ' +
          'This path belongs to a node whose visit has already completed. ' +
          'The removal will have no effect. ' +
          "To remove a parent node, do so from the parent's own visitor.",
      );
    }
    this.#removed = true;
  }

  // ===========================================================================
  // Internal methods for traversal engine
  // ===========================================================================

  /**
   * @internal
   */
  _getReplacementNode(): TNode | undefined {
    return this.#replacementNode;
  }

  /**
   * @internal
   */
  _wasReplaced(): boolean {
    return this.#replaced;
  }

  /**
   * @internal
   */
  _reset(): void {
    this.#shouldSkip = false;
    this.#shouldStop = false;
    this.#removed = false;
    this.#replaced = false;
    this.#replacementNode = undefined;
  }

  /**
   * Mark this path as stale (visit completed).
   * @internal
   */
  _markStale(): void {
    this.#stale = true;
  }
}
