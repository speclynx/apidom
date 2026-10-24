import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assert } from 'chai';
import dedent from 'dedent';
import {
  Element,
  MemberElement,
  ObjectElement,
  cloneDeep,
  includesClasses,
  isArrayElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractArazzoSpecification1,
  refractorPluginReplaceEmptyElement,
  ArazzoSpecification1Element,
} from '../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const collectObjects = (element: Element, objects: ObjectElement[] = []): ObjectElement[] => {
  if (isObjectElement(element)) {
    objects.push(element);
    element.forEach((value) => collectObjects(value, objects));
  } else if (isArrayElement(element)) {
    element.forEach((item) => collectObjects(item, objects));
  }
  return objects;
};

const refractYAML = async (yaml: string) => {
  const { result } = await parse(yaml);
  return refractArazzoSpecification1(result) as ArazzoSpecification1Element;
};

describe('refractor', function () {
  context('given empty YAML nodes', function () {
    let genericElement: ObjectElement;

    beforeEach(function () {
      const arazzoPojo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'pet-purchase.json')).toString(),
      );
      genericElement = new ObjectElement(arazzoPojo);
    });

    specify('should refract an empty key in every object', async function () {
      // the empty key of `: 1`, which is also how a key being typed above an entry is parsed
      const { result } = await parse(': 1');
      const emptyKeyMember = (result as ObjectElement).getMember('') as MemberElement;
      collectObjects(genericElement).forEach((objectElement) => {
        objectElement.unshift(cloneDeep(emptyKeyMember));
      });

      assert.doesNotThrow(() =>
        refractArazzoSpecification1(genericElement, {
          plugins: [refractorPluginReplaceEmptyElement()],
        }),
      );
    });

    specify('should refract an empty value in every scalar field', async function () {
      const { result } = await parse('a:');
      const emptyValue = (result as ObjectElement).get('a') as Element;
      collectObjects(genericElement).forEach((objectElement) => {
        objectElement.forEach((value, _key, memberElement) => {
          if (isObjectElement(value) || isArrayElement(value)) return;
          (memberElement as MemberElement).value = cloneDeep(emptyValue);
        });
      });

      assert.doesNotThrow(() =>
        refractArazzoSpecification1(genericElement, {
          plugins: [refractorPluginReplaceEmptyElement()],
        }),
      );
    });

    specify('should keep an empty key as a generic member', async function () {
      const arazzoElement = await refractYAML(dedent`
        arazzo: 1.0.1
        : 1
        info:
          : 1
          title: t
          version: 1.0.0
      `);

      assert.strictEqual(arazzoElement.get('')?.toValue(), 1);
      assert.strictEqual(arazzoElement.info?.get('')?.toValue(), 1);
    });

    specify('should not refract an empty key of Components maps', async function () {
      const arazzoElement = await refractYAML(dedent`
        arazzo: 1.0.1
        components:
          inputs:
            :
              type: string
          parameters:
            :
              name: a
              in: query
          successActions:
            :
              name: a
              type: end
          failureActions:
            :
              name: a
              type: end
      `);
      const { components } = arazzoElement;
      const mapElements = [
        components?.inputs,
        components?.parameters,
        components?.successActions,
        components?.failureActions,
      ];

      mapElements.forEach((mapElement) => {
        assert.strictEqual(mapElement?.get('')?.element, 'object');
      });
    });

    specify('should refract an empty arazzo field to an empty string', async function () {
      const arazzoElement = await refractYAML('arazzo:\n');

      assert.strictEqual(arazzoElement.arazzo?.toValue(), '');
      assert.isNull(toValue(arazzoElement.arazzo));
      assert.isTrue(includesClasses(arazzoElement.arazzo!, ['yaml-e-node']));
    });
  });
});
