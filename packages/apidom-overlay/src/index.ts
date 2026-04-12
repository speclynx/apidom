export {
  applyAction as applyActionApiDOM,
  applyOverlay as applyOverlayApiDOM,
  type ApplyOptions,
} from './apply/realms/apidom.ts';
export {
  default as applyOverlay,
  defaultOptions as defaultApplyOverlayOptions,
  type ApplyOverlayOptions,
} from './apply/realms/uri.ts';
export {
  applyAction as applyActionPOJO,
  applyOverlay as applyOverlayPOJO,
} from './apply/realms/pojo.ts';
export { validateAction, type ValidationResult } from './validate.ts';
export { default as OverlayError, type OverlayErrorOptions } from './errors/OverlayError.ts';
export type { OverlayTrace, ActionTrace, ActionTraceType } from './apply/trace/index.ts';
