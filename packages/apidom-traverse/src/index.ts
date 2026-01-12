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

// Operations
export { default as filter } from './operations/filter.ts';
export { default as find } from './operations/find.ts';
export { default as some } from './operations/some.ts';
export { default as reject } from './operations/reject.ts';
export { default as forEach } from './operations/for-each.ts';
export type { Callback as ForEachCallback, ForEachOptions } from './operations/for-each.ts';
export { default as parents } from './operations/parents.ts';
export { default as findAtOffset } from './operations/find-at-offset.ts';
export type { FindAtOffsetOptions } from './operations/find-at-offset.ts';
