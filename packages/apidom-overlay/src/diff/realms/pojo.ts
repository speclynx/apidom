import { refract } from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';

import { diff as diffApiDOM, type DiffOptions } from './apidom.ts';

/**
 * Computes the diff between two plain JavaScript objects and returns an Overlay document
 * as a plain JavaScript object.
 *
 * @public
 */
export const diff = (
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  options?: DiffOptions,
): unknown => toValue(diffApiDOM(refract(left), refract(right), options));
