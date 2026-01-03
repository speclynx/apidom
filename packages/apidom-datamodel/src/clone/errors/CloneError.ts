import { ApiDOMStructuredError } from '@speclynx/apidom-error';
import type { ApiDOMErrorOptions } from '@speclynx/apidom-error';

/**
 * @public
 */
export interface CloneErrorOptions extends ApiDOMErrorOptions {
  readonly value: unknown;
}

/**
 * @public
 */
class CloneError extends ApiDOMStructuredError {
  public readonly value: unknown;

  constructor(message?: string, structuredOptions?: CloneErrorOptions) {
    super(message, structuredOptions);

    if (typeof structuredOptions !== 'undefined') {
      this.value = structuredOptions.value;
    }
  }
}

export default CloneError;
