import ApiDOMAggregateError from './ApiDOMAggregateError.ts';
import type ApiDOMErrorOptions from './ApiDOMErrorOptions.ts';

/**
 * @public
 */
class ApiDOMError extends Error {
  public static [Symbol.hasInstance](instance: unknown) {
    // we want to ApiDOMAggregateError to act as if ApiDOMError was its superclass
    return (
      super[Symbol.hasInstance](instance) ||
      Function.prototype[Symbol.hasInstance].call(ApiDOMAggregateError, instance)
    );
  }

  constructor(message?: string, options?: ApiDOMErrorOptions) {
    super(message, options);

    this.name = this.constructor.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiDOMError;
