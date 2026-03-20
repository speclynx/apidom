// Overlay 1.1.0 elements
import OverlayElement from './elements/Overlay.ts';
import Overlay1Element from './elements/Overlay1.ts';
import InfoElement from './elements/Info.ts';
import ActionElement from './elements/Action.ts';
// NCE types
import ActionsElement from './elements/nces/Actions.ts';

/**
 * @public
 */
export const isOverlayElement = (element: unknown): element is OverlayElement =>
  element instanceof OverlayElement;

/**
 * @public
 */
export const isOverlay1Element = (element: unknown): element is Overlay1Element =>
  element instanceof Overlay1Element;

/**
 * @public
 */
export const isInfoElement = (element: unknown): element is InfoElement =>
  element instanceof InfoElement;

/**
 * @public
 */
export const isActionElement = (element: unknown): element is ActionElement =>
  element instanceof ActionElement;

/**
 * @public
 */
export const isActionsElement = (element: unknown): element is ActionsElement =>
  element instanceof ActionsElement;
