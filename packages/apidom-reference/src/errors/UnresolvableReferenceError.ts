import ResolveError from './ResolveError.ts';

/**
 * Thrown when a reference cannot be resolved. Resolution is shared by the
 * dereference and bundle components, so this error lives under `ResolveError`.
 *
 * @public
 */
class UnresolvableReferenceError extends ResolveError {}

export default UnresolvableReferenceError;
