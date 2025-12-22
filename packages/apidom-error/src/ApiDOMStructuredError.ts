import ApiDOMError from './ApiDOMError.ts';
import type ApiDOMErrorOptions from './ApiDOMErrorOptions.ts';

/**
 * @public
 */
class ApiDOMStructuredError extends ApiDOMError {
  constructor(message?: string, structuredOptions?: ApiDOMErrorOptions) {
    super(message, structuredOptions);

    if (structuredOptions != null && typeof structuredOptions === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cause, ...causelessOptions } = structuredOptions;
      Object.assign(this, causelessOptions);
    }
  }
}

export default ApiDOMStructuredError;
