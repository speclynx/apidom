import { Mixin } from 'ts-mixer';

import FallbackVisitor from '../FallbackVisitor.ts';
import SpecificationVisitor from '../SpecificationVisitor.ts';
import FixedFieldsVisitor from '../generics/FixedFieldsVisitor.ts';
import MapVisitor from '../generics/MapVisitor.ts';
import ParentSchemaAwareVisitor from './ParentSchemaAwareVisitor.ts';

/**
 * These base classes are exported to satisfy api-extractor's ae-forgotten-export warnings.
 * When ts-mixer creates mixin classes, TypeScript generates internal *_base types that
 * need to be exported from the entry point.
 */

/** @public */
export const JSONSchemaVisitorBase = Mixin(
  FixedFieldsVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const JSONReferenceVisitorBase = Mixin(FixedFieldsVisitor, FallbackVisitor);
/** @public */
export const LinkDescriptionVisitorBase = Mixin(FixedFieldsVisitor, FallbackVisitor);
/** @public */
export const MediaVisitorBase = Mixin(FixedFieldsVisitor, FallbackVisitor);

/** @public */
export const AllOfVisitorBase = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const AnyOfVisitorBase = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const OneOfVisitorBase = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const ItemsVisitorBase = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const LinksVisitorBase = Mixin(
  SpecificationVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);

/** @public */
export const DefinitionsVisitorBase = Mixin(MapVisitor, ParentSchemaAwareVisitor, FallbackVisitor);
/** @public */
export const DependenciesVisitorBase = Mixin(MapVisitor, ParentSchemaAwareVisitor, FallbackVisitor);
/** @public */
export const PatternPropertiesVisitorBase = Mixin(
  MapVisitor,
  ParentSchemaAwareVisitor,
  FallbackVisitor,
);
/** @public */
export const PropertiesVisitorBase = Mixin(MapVisitor, ParentSchemaAwareVisitor, FallbackVisitor);
