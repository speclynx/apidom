import { refract } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { refractAction, refractOverlay1 } from '@speclynx/apidom-ns-overlay-1';

import { applyAction as applyActionApiDOM, applyOverlay as applyOverlayApiDOM } from './apidom.ts';

/**
 * Applies a single overlay action (POJO) to a target (POJO).
 *
 * @public
 */
export const applyAction = (action: object, target: object): unknown =>
  toValue(applyActionApiDOM(refractAction(action), refract(target)));

/**
 * Applies an entire overlay document (POJO) to a target (POJO).
 *
 * @public
 */
export const applyOverlay = (overlay: object, target: object): unknown =>
  toValue(applyOverlayApiDOM(refractOverlay1(overlay), refract(target)));
