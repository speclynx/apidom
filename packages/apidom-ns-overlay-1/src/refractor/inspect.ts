import { resolveSpecification, type ResolvedSpecification } from '@speclynx/apidom-core';
import { isPlainObject } from 'ramda-adjunct';

import OverlayElement from '../elements/Overlay.ts';
import Overlay1Element from '../elements/Overlay1.ts';
import InfoElement from '../elements/Info.ts';
import ActionElement from '../elements/Action.ts';
import ComponentsElement from '../elements/Components.ts';
import ReusableActionElement from '../elements/ReusableAction.ts';
import ReusableActionReferenceElement from '../elements/ReusableActionReference.ts';
import specification from './specification.ts';

/**
 * @public
 */
export interface FixedField {
  name: string;
  alias?: string;
  $visitor: unknown;
}

interface ResolvedSpec extends ResolvedSpecification {
  visitors: {
    document: {
      objects: Record<string, { fixedFields: Record<string, unknown> }>;
    };
  };
}

const resolvedSpec = resolveSpecification<ResolvedSpec>(specification);

const getFixedFields = (fixedFieldsSpec: Record<string, unknown>): FixedField[] => {
  return Object.entries(fixedFieldsSpec).map(([name, fieldSpec]) => {
    if (isPlainObject(fieldSpec)) {
      return { name, ...fieldSpec } as FixedField;
    }
    return { name, $visitor: fieldSpec };
  });
};

Object.defineProperty(Overlay1Element, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Overlay.fixedFields),
  enumerable: true,
});

Object.defineProperty(InfoElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Info.fixedFields),
  enumerable: true,
});

Object.defineProperty(ActionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Action.fixedFields),
  enumerable: true,
});

Object.defineProperty(ComponentsElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.Components.fixedFields),
  enumerable: true,
});

Object.defineProperty(ReusableActionElement, 'fixedFields', {
  get: () => getFixedFields(resolvedSpec.visitors.document.objects.ReusableAction.fixedFields),
  enumerable: true,
});

Object.defineProperty(ReusableActionReferenceElement, 'fixedFields', {
  get: () =>
    getFixedFields(resolvedSpec.visitors.document.objects.ReusableActionReference.fixedFields),
  enumerable: true,
});

export {
  OverlayElement,
  Overlay1Element,
  InfoElement,
  ActionElement,
  ComponentsElement,
  ReusableActionElement,
  ReusableActionReferenceElement,
};
