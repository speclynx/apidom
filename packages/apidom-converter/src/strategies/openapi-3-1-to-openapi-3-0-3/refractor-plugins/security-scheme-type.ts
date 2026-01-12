import {
  ComponentsElement,
  OpenApi3_1Element,
  SecurityRequirementElement,
  SecuritySchemeElement,
  isSecuritySchemeElement,
  isComponentsElement,
  isReferenceElement,
  mediaTypes,
} from '@speclynx/apidom-ns-openapi-3-1';
import {
  Element,
  ParseResultElement,
  AnnotationElement,
  isObjectElement,
  cloneDeep,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { dereferenceApiDOM, ReferenceSet, Reference, url } from '@speclynx/apidom-reference';
import { type Path } from '@speclynx/apidom-traverse';

import type { Toolbox } from '../toolbox.ts';

type SecuritySchemeTypePluginOptions = {
  annotations: AnnotationElement[];
};

const securitySchemeTypeRefractorPlugin =
  ({ annotations }: SecuritySchemeTypePluginOptions) =>
  (toolbox: Toolbox) => {
    let parseResultElement: ParseResultElement | undefined;
    const isRemovableSecuritySchemeElement = (value: unknown): value is SecuritySchemeElement =>
      isSecuritySchemeElement(value) && toValue(value.type) === 'mutualTLS';
    const removedSecuritySchemes: SecuritySchemeElement[] = [];
    const createAnnotation = <T extends Element>(element: T) =>
      toolbox.createAnnotation.fromElement(
        element,
        'The "mutualTLS" type Security Scheme Object is not supported in OpenAPI 3.0.3. As a result, all Security Scheme Objects specified with the "mutualTLS" type have been removed.',
        { classes: ['error'] },
        { code: 'mutualTLS' },
      );

    return {
      visitor: {
        ParseResultElement(path: Path<ParseResultElement>) {
          parseResultElement = path.node;
        },
        OpenApi3_1Element(path: Path<OpenApi3_1Element>) {
          const element = path.node;
          if (!isComponentsElement(element.components)) return undefined;
          if (!isObjectElement(element.components.securitySchemes)) return undefined;

          element.components.securitySchemes.forEach((value) => {
            if (isSecuritySchemeElement(value) && toValue(value.type) === 'mutualTLS') {
              removedSecuritySchemes.push(value);
            }
          });

          return undefined;
        },
        async ComponentsElement(path: Path<ComponentsElement>) {
          const element = path.node;
          if (!isObjectElement(element.securitySchemes)) return undefined;

          /**
           * Removing Reference Objects pointing to removable Security Scheme Objects.
           * We need to remove Reference Objects first as they might be pointing
           * to Security Scheme Objects that are going to be removed.
           */
          const baseURI = url.cwd();
          const rootReference = new Reference({
            uri: baseURI,
            value: cloneDeep(parseResultElement!),
          });
          for (const memberElement of element.securitySchemes) {
            if (!isReferenceElement(memberElement.value)) continue;

            const { value: referenceElement } = memberElement;
            const reference = new Reference({
              uri: `${baseURI}#reference`,
              value: new ParseResultElement([referenceElement]),
            });
            const refSet = new ReferenceSet({ refs: [reference, rootReference] });

            const dereferenced = await dereferenceApiDOM(referenceElement, {
              resolve: { baseURI: reference.uri },
              parse: { mediaType: mediaTypes.latest() },
              dereference: { refSet, immutable: false },
            });

            if (isRemovableSecuritySchemeElement(dereferenced)) {
              element.securitySchemes.remove(toValue(memberElement.key) as string);
              annotations.push(createAnnotation(referenceElement));
            }
          }

          /**
           * Removing Security Scheme Objects.
           */
          element.securitySchemes.forEach((value, key) => {
            if (isRemovableSecuritySchemeElement(value)) {
              if (!removedSecuritySchemes.includes(value)) removedSecuritySchemes.push(value);
              (element.securitySchemes as SecuritySchemeElement).remove(toValue(key) as string);
              annotations.push(createAnnotation(value));
            }
          });

          return undefined;
        },
        SecurityRequirementElement(path: Path<SecurityRequirementElement>) {
          const element = path.node;
          if (!removedSecuritySchemes.length) return undefined;

          const keysToRemove: string[] = [];

          element.forEach((value, key) => {
            const removedSecurityScheme = removedSecuritySchemes.find(
              (securityScheme) => toValue(securityScheme.name) === toValue(key),
            );

            if (isSecuritySchemeElement(removedSecurityScheme)) {
              keysToRemove.push(toValue(key) as string);
              annotations.push(createAnnotation(value));
            }
          });

          if (!keysToRemove.length) return undefined;

          keysToRemove.forEach((key) => {
            element.remove(key);
          });

          return undefined;
        },
      },
      post() {
        removedSecuritySchemes.length = 0;
        parseResultElement = undefined;
      },
    };
  };

export default securitySchemeTypeRefractorPlugin;
