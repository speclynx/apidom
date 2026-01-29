import {
  Namespace,
  Element,
  cloneShallow,
  ParseResultElement,
  isStringElement,
} from '@speclynx/apidom-datamodel';
import { IdentityManager, toValue } from '@speclynx/apidom-core';
import { ApiDOMError } from '@speclynx/apidom-error';
import { Path } from '@speclynx/apidom-traverse';
import {
  ArazzoSpecification1Element,
  ReusableElement,
  isParameterElement,
} from '@speclynx/apidom-ns-arazzo-1';
import { parse as parseRuntimeExpression } from '@swaggerexpert/arazzo-runtime-expression';
import {
  compile as jsonPointerCompile,
  evaluate as jsonPointerEvaluate,
} from '@speclynx/apidom-json-pointer';

import Reference from '../../../Reference.ts';
import type { ReferenceOptions } from '../../../options/index.ts';

// initialize element identity manager
const identityManager = new IdentityManager();

/**
 * @public
 */
export interface Arazzo1DereferenceVisitorOptions {
  readonly namespace: Namespace;
  readonly reference: Reference;
  readonly options: ReferenceOptions;
}

/**
 * @public
 */
class Arazzo1DereferenceVisitor {
  protected readonly namespace: Namespace;

  protected readonly reference: Reference;

  protected readonly options: ReferenceOptions;

  constructor({ reference, namespace, options }: Arazzo1DereferenceVisitorOptions) {
    this.namespace = namespace;
    this.reference = reference;
    this.options = options;
  }

  public ReusableElement(path: Path<Element>) {
    const referencingElement = path.node as ReusableElement;

    // skip current referencing schema as $ref keyword was not defined
    if (!isStringElement(referencingElement.reference)) {
      path.skip();
      return;
    }

    // ignore if resolve.internal is false (Reusable Objects are internal references only)
    if (!this.options.resolve.internal) {
      path.skip();
      return;
    }
    const runtimeExpression = toValue(referencingElement.reference) as string;

    // parse the runtime expression
    const { result, tree } = parseRuntimeExpression(runtimeExpression);

    if (!result.success) {
      throw new ApiDOMError(`Invalid Reusable Object reference format: "${runtimeExpression}"`);
    }

    // ReusableElement can only reference components
    if (tree.type !== 'ComponentsExpression') {
      throw new ApiDOMError(
        `Reusable Object reference "${runtimeExpression}" must be a components expression`,
      );
    }

    // evaluate runtime expression as JSON Pointer to get the referenced element
    const jsonPointer = jsonPointerCompile(['components', tree.field, tree.subField]);
    let referencedElement: Element;
    try {
      referencedElement = jsonPointerEvaluate<Element>(
        (this.reference.value as ParseResultElement).result as ArazzoSpecification1Element,
        jsonPointer,
      );
    } catch {
      throw new ApiDOMError(`Reusable Object reference "${runtimeExpression}" cannot be resolved`);
    }

    /**
     * Create a shallow clone of the referenced element to avoid modifying the original.
     */
    const mergedElement = cloneShallow(referencedElement);
    // assign unique id to merged element
    mergedElement.meta.set('id', identityManager.generateId());
    // annotate with info about original referencing element
    mergedElement.meta.set('ref-fields', {
      reference: runtimeExpression,
      value: toValue(referencingElement.value),
    });
    // annotate with info about origin
    mergedElement.meta.set('ref-origin', this.reference.uri);
    // annotate with info about referencing element
    mergedElement.meta.set(
      'ref-referencing-element-id',
      identityManager.identify(referencingElement),
    );

    // override value field if present for Parameter Objects
    if (isParameterElement(mergedElement) && referencingElement.hasKey('value')) {
      mergedElement.remove('value');
      mergedElement.set('value', referencingElement.get('value'));
    }

    /**
     * Transclude referencing element with merged referenced element.
     */
    path.replaceWith(mergedElement);
  }
}

export default Arazzo1DereferenceVisitor;
