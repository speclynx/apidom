import { refract } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractAction, refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';

import {
  applyAction as applyActionApiDOM,
  applyOverlay as applyOverlayApiDOM,
  type ApplyOptions,
} from './apidom.ts';

/**
 * Applies a single overlay action (POJO) to a target (POJO).
 *
 * The refracted target never escapes this function and the result is converted
 * straight back to a POJO, so it is applied in place.
 *
 * @public
 */
export const applyAction = (
  action: Record<string, unknown>,
  target: Record<string, unknown>,
  options?: ApplyOptions,
): unknown =>
  toValue(
    applyActionApiDOM(refractAction(action), refract(target), { ...options, immutable: false }),
  );

/**
 * Applies an entire overlay document (POJO) to a target (POJO).
 *
 * The refracted target never escapes this function and the result is converted
 * straight back to a POJO, so it is applied in place.
 *
 * @public
 */
export const applyOverlay = (
  overlay: Record<string, unknown>,
  target: Record<string, unknown>,
  options?: ApplyOptions,
): unknown =>
  toValue(
    applyOverlayApiDOM(refractOverlay1(overlay), refract(target), {
      ...options,
      immutable: false,
    }),
  );
