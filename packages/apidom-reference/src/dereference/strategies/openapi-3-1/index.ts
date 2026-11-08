import { propEq } from 'ramda';
import { Element, ParseResultElement } from '@speclynx/apidom-datamodel';
import { isOpenApi3_1Element, mediaTypes } from '@speclynx/apidom-ns-openapi-3-1';

import DereferenceStrategy, { DereferenceStrategyOptions } from '../DereferenceStrategy.ts';
import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import OpenAPI3_1DereferenceVisitor from './visitor.ts';
import { detachedRootSchema$ids } from './util.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

export type {
  default as DereferenceStrategy,
  DereferenceStrategyOptions,
} from '../DereferenceStrategy.ts';
export type { default as File, FileOptions } from '../../../File.ts';
export type { default as Reference, ReferenceOptions } from '../../../Reference.ts';
export type { default as ReferenceSet, ReferenceSetOptions } from '../../../ReferenceSet.ts';
export type { OpenAPI3_1DereferenceVisitorOptions } from './visitor.ts';
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
export interface OpenAPI3_1DereferenceStrategyOptions extends Omit<
  DereferenceStrategyOptions,
  'name'
> {}

/**
 * @public
 */
class OpenAPI3_1DereferenceStrategy extends DereferenceStrategy {
  constructor(options?: OpenAPI3_1DereferenceStrategyOptions) {
    super({ ...(options ?? {}), name: 'openapi-3-1' });
  }

  canDereference(file: File): boolean {
    // assert by media type
    if (file.mediaType !== 'text/plain') {
      return mediaTypes.includes(file.mediaType);
    }

    // assert by inspecting ApiDOM
    return isOpenApi3_1Element(file.parseResult?.result);
  }

  async dereference(file: File, options: ReferenceOptions): Promise<Element> {
    const refSet = options.dereference.refSet ?? new ReferenceSet();
    let reference: Reference;

    if (!refSet.has(file.uri)) {
      reference = new Reference({ uri: file.uri, value: file.parseResult! });
      refSet.add(reference);
    } else {
      // pre-computed refSet was provided as configuration option
      reference = refSet.find(propEq(file.uri, 'uri'))!;
    }

    /**
     * With the immutable option the dereferenced element is a new tree,
     * otherwise the dereferenced root is dereferenced in place.
     */
    const root = refSet.rootRef!.value as ParseResultElement;
    const visitor = new OpenAPI3_1DereferenceVisitor({ reference, options });
    const dereferencedElement: Element = await visitor.dereference(root, {
      ancestorSchema$ids: detachedRootSchema$ids(root.result),
    });

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

export { OpenAPI3_1DereferenceVisitor };
export {
  resolveSchema$refField,
  resolveSchema$idField,
  maybeRefractToSchemaElement,
} from './util.ts';

export default OpenAPI3_1DereferenceStrategy;
