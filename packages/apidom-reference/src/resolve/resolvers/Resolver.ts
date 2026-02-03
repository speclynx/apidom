import File from '../../File.ts';
import type { ReferenceOptions } from '../../options/index.ts';

/**
 * @public
 */
export interface ResolverOptions {
  readonly name: string;
}

/**
 * @public
 */
abstract class Resolver {
  public readonly name: string;

  constructor({ name }: ResolverOptions) {
    this.name = name;
  }

  public abstract canRead(file: File, options?: ReferenceOptions): boolean;
  public abstract read(file: File, options?: ReferenceOptions): Promise<Buffer>;
}

export default Resolver;
