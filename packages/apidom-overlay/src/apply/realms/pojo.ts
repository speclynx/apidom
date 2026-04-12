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
 * @public
 */
export const applyAction = (
  action: Record<string, unknown>,
  target: Record<string, unknown>,
  options?: ApplyOptions,
): unknown => toValue(applyActionApiDOM(refractAction(action), refract(target), options));

/**
 * Applies an entire overlay document (POJO) to a target (POJO).
 *
 * @public
 */
export const applyOverlay = (
  overlay: Record<string, unknown>,
  target: Record<string, unknown>,
  options?: ApplyOptions,
): unknown => toValue(applyOverlayApiDOM(refractOverlay1(overlay), refract(target), options));
