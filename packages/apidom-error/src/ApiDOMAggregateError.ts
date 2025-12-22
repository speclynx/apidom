import type ApiDOMErrorOptions from './ApiDOMErrorOptions.ts';

/**
 * @public
 */
class ApiDOMAggregateError extends AggregateError {
  constructor(errors: Iterable<unknown>, message?: string, options?: ApiDOMErrorOptions) {
    super(errors, message, options);

    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiDOMAggregateError;
