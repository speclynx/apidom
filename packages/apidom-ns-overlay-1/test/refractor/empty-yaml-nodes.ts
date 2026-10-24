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
  isArrayElement,
  isObjectElement,
} from '@speclynx/apidom-datamodel';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractOverlay1,
  refractorPluginReplaceEmptyElement,
  Overlay1Element,
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
  return refractOverlay1(result) as Overlay1Element;
};

describe('refractor', function () {
  context('given empty YAML nodes', function () {
    let genericElement: ObjectElement;

    beforeEach(function () {
      const overlayPojo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'overlay.json')).toString(),
      );
      genericElement = new ObjectElement(overlayPojo);
    });

    specify('should refract an empty key in every object', async function () {
      // the empty key of `: 1`, which is also how a key being typed above an entry is parsed
      const { result } = await parse(': 1');
      const emptyKeyMember = (result as ObjectElement).getMember('') as MemberElement;
      collectObjects(genericElement).forEach((objectElement) => {
        objectElement.unshift(cloneDeep(emptyKeyMember));
      });

      assert.doesNotThrow(() =>
        refractOverlay1(genericElement, { plugins: [refractorPluginReplaceEmptyElement()] }),
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
        refractOverlay1(genericElement, { plugins: [refractorPluginReplaceEmptyElement()] }),
      );
    });

    specify('should keep an empty key as a generic member', async function () {
      const overlayElement = await refractYAML(dedent`
        overlay: 1.1.0
        : 1
        info:
          : 1
          title: t
          version: 1.0.0
      `);

      assert.strictEqual(toValue(overlayElement.get('')), 1);
      assert.strictEqual(toValue(overlayElement.info?.get('')), 1);
    });
  });
});
