import { Mixin } from 'ts-mixer';
import {
  FallbackVisitor,
  FallbackVisitorOptions,
  SpecificationVisitor,
  SpecificationVisitorOptions,
  MapVisitor,
  MapVisitorOptions,
  ParentSchemaAwareVisitor,
  ParentSchemaAwareVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-draft-7';

/**
 * @public
 */
export interface BaseSchemaArrayVisitorOptions
  extends SpecificationVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
export const BaseSchemaArrayVisitor = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);

/**
 * @public
 */
export interface BaseSchemaMapVisitorOptions
  extends MapVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}

/**
 * @public
 */
export const BaseSchemaMapVisitor = Mixin(MapVisitor, ParentSchemaAwareVisitor, FallbackVisitor);
