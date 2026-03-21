import { Element, ParseResultElement, cloneDeep } from '@speclynx/apidom-datamodel';
import { isOverlay1Element, mediaTypes } from '@speclynx/apidom-ns-overlay-1';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import type { ReferenceOptions } from '../../../options/index.ts';
import { dereferenceExtends } from './extends.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
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
export interface Overlay1DereferenceStrategyOptions extends Omit<
  DereferenceStrategyOptions,
  'name'
> {}

/**
 * @public
 */
class Overlay1DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: Overlay1DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'overlay-1' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isOverlay1Element(file.parseResult?.result);
  }

  async dereference(file: File, options: ReferenceOptions): Promise<Element> {
    const immutableRefSet = options.dereference.refSet ?? new ReferenceSet();
    const mutableRefSet = new ReferenceSet();
    let reference: Reference;

    if (!immutableRefSet.has(file.uri)) {
      reference = new Reference({ uri: file.uri, value: file.parseResult! });
      immutableRefSet.add(reference);
    } else {
      // pre-computed refSet was provided as configuration option
      reference = immutableRefSet.find((ref) => ref.uri === file.uri)!;
    }

    /**
     * Clone refSet due the dereferencing process being mutable.
     * We don't want to mutate the original refSet and the references.
     */
    if (options.dereference.immutable) {
      immutableRefSet.refs
        .map(
          (ref) =>
            new Reference({
              ...ref,
              value: cloneDeep(ref.value),
            }),
        )
        .forEach((ref) => mutableRefSet.add(ref));
      reference = mutableRefSet.find((ref) => ref.uri === file.uri)!;
    }

    const dereferencedElement = reference.value as ParseResultElement;

    /**
     * Dereference extends target if option is enabled.
     */
    const shouldDereferenceExtends =
      options?.dereference?.strategyOpts?.[this.name]?.extends ??
      options?.dereference?.strategyOpts?.extends;

    if (shouldDereferenceExtends) {
      await dereferenceExtends(dereferencedElement, reference.uri, options);
    }

    /**
     * If immutable option is set, replay refs from the refSet.
     */
    if (options.dereference.immutable) {
      mutableRefSet.refs
        .filter((ref) => ref.uri.startsWith('immutable://'))
        .map(
          (ref) =>
            new Reference({
              ...ref,
              uri: ref.uri.replace(/^immutable:\/\//, ''),
            }),
        )
        .forEach((ref) => immutableRefSet.add(ref));
    }

    /**
     * Release all memory if this refSet was not provided as a configuration option.
     * If provided as configuration option, then provider is responsible for cleanup.
     */
    if (options.dereference.refSet === null) {
      immutableRefSet.clean();
    }

    mutableRefSet.clean();

    return dereferencedElement;
  }
}

export { dereferenceExtends } from './extends.ts';

export default Overlay1DereferenceStrategy;
