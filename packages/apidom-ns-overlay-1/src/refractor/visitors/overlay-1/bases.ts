import { Mixin } from 'ts-mixer';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import FixedFieldsVisitor, { FixedFieldsVisitorOptions } from '../generics/FixedFieldsVisitor.ts';
import MapVisitor, { MapVisitorOptions } from '../generics/MapVisitor.ts';

/**
 * Base class for visitors using Mixin(SpecificationVisitor, FallbackVisitor).
 * @public
 */
export const BaseSpecificationFallbackVisitor = Mixin(SpecificationVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseSpecificationFallbackVisitorOptions
  extends SpecificationVisitorOptions, FallbackVisitorOptions {}

/**
 * Base class for visitors using Mixin(FixedFieldsVisitor, FallbackVisitor).
 * @public
 */
export const BaseFixedFieldsFallbackVisitor = Mixin(FixedFieldsVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseFixedFieldsFallbackVisitorOptions
  extends FixedFieldsVisitorOptions, FallbackVisitorOptions {}

/**
 * Base class for visitors using Mixin(MapVisitor, FallbackVisitor).
 * @public
 */
export const BaseMapFallbackVisitor = Mixin(MapVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseMapFallbackVisitorOptions extends MapVisitorOptions, FallbackVisitorOptions {}
