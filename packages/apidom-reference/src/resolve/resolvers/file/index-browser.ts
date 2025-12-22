import Resolver from '../Resolver.ts';
import ResolverError from '../../../errors/ResolverError.ts';

export type { default as Resolver, ResolverOptions } from '../Resolver.ts';
export type { default as File, FileOptions } from '../../../File.ts';

/**
 * @public
 */
class FileResolver extends Resolver {
  constructor() {
    super({ name: 'file' });
  }

  canRead(): boolean {
    return false;
  }

  read(): Promise<Buffer> {
    throw new ResolverError('FileResolver is not intended to be used in browser context.');
  }
}

export default FileResolver;
