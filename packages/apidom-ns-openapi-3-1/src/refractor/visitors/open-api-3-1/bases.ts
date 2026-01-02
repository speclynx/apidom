import { Mixin } from 'ts-mixer';
import {
  SpecificationVisitor,
  SpecificationVisitorOptions,
  FallbackVisitor,
  FallbackVisitorOptions,
  FixedFieldsVisitor,
  FixedFieldsVisitorOptions,
  MapVisitor,
  MapVisitorOptions,
} from '@speclynx/apidom-ns-openapi-3-0';
import {
  ParentSchemaAwareVisitor,
  ParentSchemaAwareVisitorOptions,
} from '@speclynx/apidom-ns-json-schema-2020-12';

/**
 * Base class for visitors using Mixin(SpecificationVisitor, FallbackVisitor)
 * @public
 */
export const BaseSpecificationVisitor = Mixin(SpecificationVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseSpecificationVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * Base class for visitors using Mixin(FixedFieldsVisitor, FallbackVisitor)
 * @public
 */
export const BaseFixedFieldsVisitor = Mixin(FixedFieldsVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseFixedFieldsVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * Base class for visitors using Mixin(MapVisitor, FallbackVisitor)
 * @public
 */
export const BaseMapVisitor = Mixin(MapVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseMapVisitorOptions extends MapVisitorOptions, FallbackVisitorOptions {}

/**
 * Base class for visitors using Mixin(FixedFieldsVisitor, ParentSchemaAwareVisitor, FallbackVisitor)
 * @public
 */
export const BaseSchemaVisitor = Mixin(
  FixedFieldsVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);

/**
 * @public
 */
export interface BaseSchemaVisitorOptions
  extends FixedFieldsVisitorOptions, ParentSchemaAwareVisitorOptions, FallbackVisitorOptions {}
