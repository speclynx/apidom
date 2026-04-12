import { MemberElement } from '@speclynx/apidom-datamodel';
import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import type { ActionElement } from '@speclynx/apidom-ns-overlay-1';

/**
 * @public
 */
export interface OverlayErrorOptions {
  readonly cause?: Error;
  readonly action?: ActionElement;
  readonly member?: MemberElement;
  readonly [key: string]: unknown;
}

/**
 * @public
 */
class OverlayError extends ApiDOMStructuredError {
  public action?: ActionElement;

  public member?: MemberElement;

  constructor(message?: string, options?: OverlayErrorOptions) {
    super(message, options);
    this.action = options?.action;
    this.member = options?.member;
  }
}

export default OverlayError;
