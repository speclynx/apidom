import { Path } from './Path.ts';
import { traverse, traverseAsync } from './traversal.ts';

// Wire up Path.prototype.traverse methods to avoid circular imports
Path.prototype.traverse = function (this: Path<any>, visitor: any, options?: any) {
  return traverse(this.node, visitor, options);
};

Path.prototype.traverseAsync = function (this: Path<any>, visitor: any, options?: any) {
  return traverseAsync(this.node, visitor, options);
};

export { Path };
export type { VisitorFn, VisitorResult } from './Path.ts';
export {
  getNodeType,
  getNodePrimitiveType,
  isNode,
  cloneNode,
  mutateNode,
  getNodeKeys,
  getVisitFn,
  mergeVisitors,
  mergeVisitorsAsync,
} from './visitors.ts';
export type {
  NodeVisitor,
  MergeVisitorsOptions,
  MergedVisitor,
  MergedVisitorAsync,
} from './visitors.ts';
export { traverse, traverseAsync } from './traversal.ts';
export type { TraverseOptions } from './traversal.ts';
