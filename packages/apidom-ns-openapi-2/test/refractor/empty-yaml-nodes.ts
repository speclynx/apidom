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
  refractSwagger,
  refractorPluginReplaceEmptyElement,
  SwaggerElement,
  PathItemElement,
  ResponsesElement,
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
  return refractSwagger(result) as SwaggerElement;
};

describe('refractor', function () {
  context('given empty YAML nodes', function () {
    let genericElement: ObjectElement;

    beforeEach(function () {
      const swaggerPojo = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'openapi.json')).toString(),
      );
      genericElement = new ObjectElement(swaggerPojo);
    });

    specify('should refract an empty key in every object', async function () {
      // the empty key of `: 1`, which is also how a key being typed above an entry is parsed
      const { result } = await parse(': 1');
      const emptyKeyMember = (result as ObjectElement).getMember('') as MemberElement;
      collectObjects(genericElement).forEach((objectElement) => {
        objectElement.unshift(cloneDeep(emptyKeyMember));
      });

      assert.doesNotThrow(() =>
        refractSwagger(genericElement, { plugins: [refractorPluginReplaceEmptyElement()] }),
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
        refractSwagger(genericElement, { plugins: [refractorPluginReplaceEmptyElement()] }),
      );
    });

    specify('should keep an empty key as a generic member', async function () {
      const swaggerElement = await refractYAML(dedent`
        swagger: '2.0'
        : 1
        info:
          : 1
          title: t
          version: 1.0.0
      `);

      assert.strictEqual(swaggerElement.get('')?.toValue(), 1);
      assert.strictEqual(swaggerElement.info?.get('')?.toValue(), 1);
    });

    specify('should keep an empty key of Responses Object once and in place', async function () {
      const swaggerElement = await refractYAML(dedent`
        swagger: '2.0'
        paths:
          /a:
            get:
              responses:
                : 1
                '200':
                  description: ok
      `);
      const pathItemElement = swaggerElement.paths?.get('/a') as PathItemElement;
      const responsesElement = pathItemElement.getField?.responses as ResponsesElement;

      assert.deepEqual(responsesElement.keys(), ['', '200']);
    });

    specify('should refract an empty swagger field to an empty string', async function () {
      const swaggerElement = await refractYAML('swagger:\n');

      assert.strictEqual(swaggerElement.swagger?.toValue(), '');
      assert.isNull(toValue(swaggerElement.swagger));
      assert.isTrue(includesClasses(swaggerElement.swagger!, ['yaml-e-node']));
    });
  });
});
