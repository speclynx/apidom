// Overlay 1.x.y elements
import OverlayElement from './elements/Overlay.ts';
import Overlay1Element from './elements/Overlay1.ts';
import InfoElement from './elements/Info.ts';
import ActionElement from './elements/Action.ts';
import ComponentsElement from './elements/Components.ts';
import ReusableActionElement from './elements/ReusableAction.ts';
import ReusableActionReferenceElement from './elements/ReusableActionReference.ts';
// NCE types
import ActionsElement from './elements/nces/Actions.ts';
import ComponentsActionsElement from './elements/nces/ComponentsActions.ts';

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

/**
 * @public
 */
export const isComponentsElement = (element: unknown): element is ComponentsElement =>
  element instanceof ComponentsElement;

/**
 * @public
 */
export const isReusableActionElement = (element: unknown): element is ReusableActionElement =>
  element instanceof ReusableActionElement;

/**
 * @public
 */
export const isReusableActionReferenceElement = (
  element: unknown,
): element is ReusableActionReferenceElement => element instanceof ReusableActionReferenceElement;

/**
 * @public
 */
export const isComponentsActionsElement = (element: unknown): element is ComponentsActionsElement =>
  element instanceof ComponentsActionsElement;
