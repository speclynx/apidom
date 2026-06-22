import {
  ParseResultElement,
  Element,
  AnnotationElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { traverseAsync } from '@speclynx/apidom-traverse';
import { mediaTypes, isOpenApi3_0Element } from '@speclynx/apidom-ns-openapi-3-0';

import File from '../../../File.ts';
import Reference from '../../../Reference.ts';
import ReferenceSet from '../../../ReferenceSet.ts';
import * as url from '../../../util/url.ts';
import BundleStrategy, { BundleStrategyOptions } from '../BundleStrategy.ts';
import OpenAPI3_0BundleVisitor from './visitor.ts';
import type { ComponentNamesStrategy, ComponentNameCollisionSeverity } from './visitor.ts';
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
} from './visitor.ts';

/**
 * @public
 */
export interface OpenAPI3_0BundleStrategyOptions extends Omit<BundleStrategyOptions, 'name'> {
  /**
   * Determines how hoisted components are named.
   *
   * `basename` (default) - derive the name from the referenced JSON Pointer
   *   (its last token), falling back to the referenced file's basename.
   * `title` - derive Schema Object names from their `title` field, falling
   *   back to `basename` when no usable title is present.
   * A custom resolver function - receives the referenced element and reference
   *   context and returns the base name; collision suffixing is still applied.
   */
  readonly componentNamesStrategy?: ComponentNamesStrategy;
  /**
   * Determines how a component rename forced by a name collision with
   * different content is reported.
   *
   * `warn` (default) - append a warning annotation to the parse result.
   * `off` - rename silently.
   * `error` - throw a BundleError instead of renaming.
   */
  readonly onComponentNameCollision?: ComponentNameCollisionSeverity;
}

/**
 * @public
 */
class OpenAPI3_0BundleStrategy extends BundleStrategy {
  protected readonly componentNamesStrategy: ComponentNamesStrategy;

  protected readonly onComponentNameCollision: ComponentNameCollisionSeverity;

  constructor(options?: OpenAPI3_0BundleStrategyOptions) {
    super({ ...(options ?? {}), name: 'openapi-3-0' });
    this.componentNamesStrategy = options?.componentNamesStrategy ?? 'basename';
    this.onComponentNameCollision = options?.onComponentNameCollision ?? 'warn';
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
    const refSet = options.bundle.refSet ?? new ReferenceSet();

    // own a copy of the entry document so the original parse result is left intact
    const bundledParseResult = cloneDeep(file.parseResult!) as ParseResultElement;
    let reference;
    if (!refSet.has(file.uri)) {
      reference = new Reference({ uri: file.uri, value: bundledParseResult });
      refSet.add(reference);
    } else {
      reference = refSet.find((ref) => ref.uri === file.uri)!;
    }

    const entryURI = url.stripHash(file.uri);
    const entryResult = (reference.value as ParseResultElement).result as Element;

    const annotations: AnnotationElement[] = [];
    const visitor = new OpenAPI3_0BundleVisitor({
      reference,
      options,
      entryURI,
      entryResult,
      componentNamesStrategy: this.componentNamesStrategy,
      onComponentNameCollision: this.onComponentNameCollision,
      annotations,
    });
    await traverseAsync((reference.value as ParseResultElement).result as Element, visitor, {
      mutable: true,
    });

    // surface bundling diagnostics as annotations on the parse result. appended
    // (never prepended) so the result element stays ahead of annotations.
    const parseResult = reference.value as ParseResultElement;
    annotations.forEach((annotation) => {
      (parseResult.content as Element[]).push(annotation);
    });

    // release memory if this refSet was not provided as a configuration option
    if (options.bundle.refSet === null) {
      refSet.clean();
    }

    return parseResult;
  }
}

export { OpenAPI3_0BundleVisitor };
export default OpenAPI3_0BundleStrategy;
