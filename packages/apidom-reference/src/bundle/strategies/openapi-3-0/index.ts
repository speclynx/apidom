import { ParseResultElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { traverseAsync } from '@speclynx/apidom-traverse';
import { mediaTypes, isOpenApi3_0Element } from '@speclynx/apidom-ns-openapi-3-0';

import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import BundleStrategy, { BundleStrategyOptions } from '../BundleStrategy.ts';
import OpenAPI3_0BundleVisitor from './visitor.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../../../dereference/strategies/DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { OpenAPI3_0BundleVisitorOptions } from './visitor.ts';
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
export type { default as BundleStrategy, BundleStrategyOptions } from '../BundleStrategy.ts';

export type {
  ComponentNamesStrategy,
  ComponentNameResolver,
  ComponentNameResolverArgs,
  ComponentNameCollisionSeverity,
} from '../../../options/index.ts';

/**
 * @public
 */
export interface OpenAPI3_0BundleStrategyOptions extends Omit<BundleStrategyOptions, 'name'> {}

/**
 * @public
 */
class OpenAPI3_0BundleStrategy extends BundleStrategy {
  constructor(options?: OpenAPI3_0BundleStrategyOptions) {
    super({ ...(options ?? {}), name: 'openapi-3-0' });
  }

  canBundle(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isOpenApi3_0Element(file.parseResult?.result);
  }

  async bundle(file: File, options: ReferenceOptions): Promise<ParseResultElement> {
    const immutableRefSet = options.bundle.refSet ?? new ReferenceSet();
    const mutableRefSet = new ReferenceSet();
    let refSet = immutableRefSet;
    let reference;

    // determine the initial reference
    if (!immutableRefSet.has(file.uri)) {
      reference = new Reference({ uri: file.uri, value: file.parseResult! });
      immutableRefSet.add(reference);
    } else {
      // pre-computed refSet was provided as configuration option
      reference = immutableRefSet.find((ref) => ref.uri === file.uri);
    }

    /**
     * Clone refSet due the bundling process being mutable.
     * We don't want to mutate the original refSet and the references.
     */
    if (options.bundle.immutable) {
      immutableRefSet.refs
        .map((ref) => new Reference({ ...ref, value: cloneDeep(ref.value) }))
        .forEach((ref) => mutableRefSet.add(ref));
      reference = mutableRefSet.find((ref) => ref.uri === file.uri);
      refSet = mutableRefSet;
    }

    const visitor = new OpenAPI3_0BundleVisitor({
      reference: reference!,
      options,
    });
    await traverseAsync(refSet.rootRef!.value, visitor, {
      mutable: true,
    });

    const parseResult = reference!.value as ParseResultElement;

    /**
     * Release all memory if this refSet was not provided as a configuration option.
     * If provided as configuration option, then provider is responsible for cleanup.
     */
    if (options.bundle.refSet === null) {
      immutableRefSet.clean();
    }

    mutableRefSet.clean();

    return parseResult;
  }
}

export { OpenAPI3_0BundleVisitor };
export default OpenAPI3_0BundleStrategy;
