import { Element } from '@speclynx/apidom-datamodel';
import { isOpenApi3_0Element, mediaTypes } from '@speclynx/apidom-ns-openapi-3-0';
import { matches, selectBestMatch } from '@swaggerexpert/media-types';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import OpenAPI3_0DereferenceVisitor from './visitor.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { OpenAPI3_0DereferenceVisitorOptions } from './visitor.ts';
export type {
  ReferenceOptions as ApiDOMReferenceOptions,
  ReferenceBundleOptions as ApiDOMReferenceBundleOptions,
  ReferenceDereferenceOptions as ApiDOMReferenceDereferenceOptions,
  ReferenceParseOptions as ApiDOMReferenceParseOptions,
  ReferenceResolveOptions as ApiDOMReferenceResolveOptions,
} from '../../../options/index.ts';
export type { default as Parser, ParserOptions } from '../../../parse/parsers/Parser.ts';
export type { default as Resolver, ResolverOptions } from '../../../resolve/resolvers/Resolver.ts';
export type {
  default as ResolveStrategy,
  ResolveStrategyOptions,
} from '../../../resolve/strategies/ResolveStrategy.ts';
export type {
  default as BundleStrategy,
  BundleStrategyOptions,
} from '../../../bundle/strategies/BundleStrategy.ts';

/**
 * @public
 */
export interface OpenAPI3_0DereferenceStrategyOptions extends Omit<
  DereferenceStrategyOptions,
  'name'
> {}

/**
 * @public
 */
class OpenAPI3_0DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: OpenAPI3_0DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'openapi-3-0' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (!matches('text/plain', file.mediaType)) {
      return selectBestMatch(mediaTypes, file.mediaType) !== null;
    }

    // assert by inspecting ApiDOM
    return isOpenApi3_0Element(file.parseResult?.result);
  }

  async dereference(file: File, options: ReferenceOptions): Promise<Element> {
    const refSet = options.dereference.refSet ?? new ReferenceSet();
    let reference: Reference;

    if (!refSet.has(file.uri)) {
      reference = new Reference({ uri: file.uri, value: file.parseResult! });
      refSet.add(reference);
    } else {
      // pre-computed refSet was provided as configuration option
      reference = refSet.find((ref) => ref.uri === file.uri)!;
    }

    /**
     * With the immutable option the dereferenced element is a new tree,
     * otherwise the dereferenced root is dereferenced in place.
     */
    const visitor = new OpenAPI3_0DereferenceVisitor({ reference, options });
    const dereferencedElement: Element = await visitor.dereference(
      refSet.rootRef!.value,
      undefined,
    );

    /**
     * Release all memory if this refSet was not provided as a configuration option.
     * If provided as configuration option, then provider is responsible for cleanup.
     */
    if (options.dereference.refSet === null) {
      refSet.clean();
    }

    return dereferencedElement;
  }
}

export { OpenAPI3_0DereferenceVisitor };
export default OpenAPI3_0DereferenceStrategy;
