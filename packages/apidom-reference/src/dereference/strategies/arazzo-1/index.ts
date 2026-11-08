import {
  Element,
  ParseResultElement,
  isParseResultElement,
  includesClasses,
} from '@speclynx/apidom-datamodel';
import { isArazzoSpecification1Element, mediaTypes } from '@speclynx/apidom-ns-arazzo-1';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import Arazzo1DereferenceVisitor from './visitor.ts';
import { detachedRootSchema$ids } from '../openapi-3-1/util.ts';
import { dereferenceSourceDescriptions } from './source-descriptions.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { Arazzo1DereferenceVisitorOptions } from './visitor.ts';
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

/**
 * @public
 */
export interface Arazzo1DereferenceStrategyOptions extends Omit<
  DereferenceStrategyOptions,
  'name'
> {}

/**
 * @public
 */
class Arazzo1DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: Arazzo1DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'arazzo-1' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isArazzoSpecification1Element(file.parseResult?.result);
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
    const root = refSet.rootRef!.value as ParseResultElement;
    const visitor = new Arazzo1DereferenceVisitor({
      reference,
      options,
      ancestorSchema$ids: detachedRootSchema$ids(root.result),
    });
    const dereferencedElement: Element = await visitor.dereference(root);

    /**
     * Dereference source descriptions if option is enabled.
     */
    const shouldDereferenceSourceDescriptions =
      options?.dereference?.strategyOpts?.[this.name]?.sourceDescriptions ??
      options?.dereference?.strategyOpts?.sourceDescriptions;

    if (shouldDereferenceSourceDescriptions) {
      const parseResult = dereferencedElement as ParseResultElement;

      // drop any existing parse-phase source description results before pushing
      const cleaned = parseResult.reject(
        (item) => isParseResultElement(item) && includesClasses(item, ['source-description']),
      );
      parseResult.content = cleaned.content;

      const sourceDescriptions = await dereferenceSourceDescriptions(
        parseResult,
        reference.uri,
        options,
        this.name,
      );
      parseResult.push(...sourceDescriptions);
    }

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

export { Arazzo1DereferenceVisitor };
export {
  resolveSchema$refField,
  resolveSchema$idField,
  resolveArazzo$selfField,
  identifiedBy$self,
  maybeRefractToJSONSchemaElement,
} from './util.ts';
export { dereferenceSourceDescriptions } from './source-descriptions.ts';

export default Arazzo1DereferenceStrategy;
