import { Mixin } from 'ts-mixer';

import SpecificationVisitor, { SpecificationVisitorOptions } from '../SpecificationVisitor.ts';
import FallbackVisitor, { FallbackVisitorOptions } from '../FallbackVisitor.ts';
import FixedFieldsVisitor, { FixedFieldsVisitorOptions } from '../generics/FixedFieldsVisitor.ts';
import PatternedFieldsVisitor, {
  PatternedFieldsVisitorOptions,
} from '../generics/PatternedFieldsVisitor.ts';
import MapVisitor, { MapVisitorOptions } from '../generics/MapVisitor.ts';
import AlternatingVisitor, { AlternatingVisitorOptions } from '../generics/AlternatingVisitor.ts';

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
 * Base class for visitors using Mixin(PatternedFieldsVisitor, FallbackVisitor)
 * @public
 */
export const BasePatternedFieldsVisitor = Mixin(PatternedFieldsVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BasePatternedFieldsVisitorOptions
  extends PatternedFieldsVisitorOptions, FallbackVisitorOptions {}

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
 * Base class for MixedFieldsVisitor using Mixin(FixedFieldsVisitor, PatternedFieldsVisitor)
 * @public
 */
export const BaseMixedFieldsVisitor = Mixin(FixedFieldsVisitor, PatternedFieldsVisitor);

/**
 * @public
 */
export interface BaseMixedFieldsVisitorOptions
  extends FixedFieldsVisitorOptions, PatternedFieldsVisitorOptions {}

/**
 * Base class for visitors using Mixin(AlternatingVisitor, FallbackVisitor)
 * @public
 */
export const BaseAlternatingVisitor = Mixin(AlternatingVisitor, FallbackVisitor);

/**
 * @public
 */
export interface BaseAlternatingVisitorOptions
  extends AlternatingVisitorOptions, FallbackVisitorOptions {}
