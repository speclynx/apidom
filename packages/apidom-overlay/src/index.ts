export {
  applyAction as applyActionApiDOM,
  applyOverlay as applyOverlayApiDOM,
  type ApplyOptions,
} from './apply/apidom.ts';
export { default as applyOverlay, type ApplyOverlayOptions } from './apply/uri.ts';
export { applyAction as applyActionPOJO, applyOverlay as applyOverlayPOJO } from './apply/pojo.ts';
export { validateAction, type ValidationResult } from './validate.ts';
export { default as OverlayError, type OverlayErrorOptions } from './errors/OverlayError.ts';
