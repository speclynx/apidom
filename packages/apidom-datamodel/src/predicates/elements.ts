import LinkElement from '../elements/LinkElement.ts';
import RefElement from '../elements/RefElement.ts';
import AnnotationElement from '../elements/Annotation.ts';
import CommentElement from '../elements/Comment.ts';
import ParseResultElement from '../elements/ParseResult.ts';
import SourceMapElement from '../elements/SourceMap.ts';

/**
 * @public
 */
export const isLinkElement = (element: unknown): element is LinkElement =>
  element instanceof LinkElement;

/**
 * @public
 */
export const isRefElement = (element: unknown): element is RefElement =>
  element instanceof RefElement;

/**
 * @public
 */
export const isAnnotationElement = (element: unknown): element is AnnotationElement =>
  element instanceof AnnotationElement;

/**
 * @public
 */
export const isCommentElement = (element: unknown): element is CommentElement =>
  element instanceof CommentElement;

/**
 * @public
 */
export const isParseResultElement = (element: unknown): element is ParseResultElement =>
  element instanceof ParseResultElement;

/**
 * @public
 */
export const isSourceMapElement = (element: unknown): element is SourceMapElement =>
  element instanceof SourceMapElement;
