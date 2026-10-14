import { assert } from 'chai';

/**
 * Async counterpart of `assert.throws`: awaits the promise and asserts it rejects.
 */
const assertRejects = async (
  promise: Promise<unknown>,
  errorClass?: new (...args: any[]) => Error,
  pattern?: RegExp,
): Promise<Error> => {
  try {
    await promise;
  } catch (error: unknown) {
    if (errorClass !== undefined) assert.instanceOf(error, errorClass);
    if (pattern !== undefined) assert.match((error as Error).message, pattern);
    return error as Error;
  }

  return assert.fail('expected promise to reject');
};

export default assertRejects;
