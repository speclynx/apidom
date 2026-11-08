import { Element } from '@speclynx/apidom-datamodel';
import { isSwaggerElement, mediaTypes } from '@speclynx/apidom-ns-openapi-2';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import OpenAPI2DereferenceVisitor from './visitor.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { OpenAPI2DereferenceVisitorOptions } from './visitor.ts';
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
export type { AncestorLineage } from '../../util.ts';
export type { AsyncAPI2DereferenceVisitorOptions } from '../asyncapi-2/visitor.ts';

/**
 * @public
 */
export interface OpenAPI2DereferenceStrategyOptions extends Omit<
  DereferenceStrategyOptions,
  'name'
> {}

/**
 * @public
 */
class OpenAPI2DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: OpenAPI2DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'openapi-2' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isSwaggerElement(file.parseResult?.result);
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
    const visitor = new OpenAPI2DereferenceVisitor({ reference, options });
    const dereferencedElement: Element = await visitor.dereference(
      refSet.rootRef!.value,
      undefined,
    );

    /**
     * Release all memory if this refSet was not provided as an configuration option.
     * If provided as configuration option, then provider is responsible for cleanup.
     */
    if (options.dereference.refSet === null) {
      refSet.clean();
    }

    return dereferencedElement;
  }
}

export { OpenAPI2DereferenceVisitor };
export default OpenAPI2DereferenceStrategy;
