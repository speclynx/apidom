import { ParseResultElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { traverseAsync } from '@speclynx/apidom-traverse';
import { mediaTypes, isAsyncApi2Element } from '@speclynx/apidom-ns-asyncapi-2';

import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import BundleStrategy, { BundleStrategyOptions } from '../BundleStrategy.ts';
import AsyncAPI2BundleVisitor from './visitor.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../../../dereference/strategies/DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { AsyncAPI2BundleVisitorOptions } from './visitor.ts';
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
export interface AsyncAPI2BundleStrategyOptions extends Omit<BundleStrategyOptions, 'name'> {}

/**
 * @public
 */
class AsyncAPI2BundleStrategy extends BundleStrategy {
  constructor(options?: AsyncAPI2BundleStrategyOptions) {
    super({ ...(options ?? {}), name: 'asyncapi-2' });
  }

  canBundle(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isAsyncApi2Element(file.parseResult?.result);
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

    const visitor = new AsyncAPI2BundleVisitor({
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

export { AsyncAPI2BundleVisitor };
export default AsyncAPI2BundleStrategy;
