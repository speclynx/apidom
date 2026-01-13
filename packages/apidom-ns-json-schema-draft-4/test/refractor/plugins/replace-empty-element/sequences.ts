import { expect } from 'chai';
import dedent from 'dedent';
import { hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  refractJSONSchema,
  JSONSchemaElement,
} from '../../../../src/index.ts';

describe('given empty value for field allOf', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          allOf:
           -
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchema = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchema)).toMatchSnapshot();
  });
});

describe('given empty value for field anyOf', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          anyOf:
           -
           -
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchema = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchema)).toMatchSnapshot();
  });
});

describe('given empty value for field oneOf', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          oneOf:
           -
           -
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchema = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchema)).toMatchSnapshot();
  });
});

describe('given JSON Schema definition with no empty values', function () {
  it('should do nothing', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          oneOf:
           - {}
           - {}
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given JSON Schema definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          oneOf:
           -
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;
    const { oneOf: oneOfValue } = jsonSchemaElement;
    const firstItem = oneOfValue?.get(0);

    expect(hasElementSourceMap(oneOfValue!)).to.be.true;
    expect(hasElementSourceMap(firstItem!)).to.be.true;
    expect(firstItem!.startLine).to.equal(2);
    expect(firstItem!.startCharacter).to.equal(2);
    expect(firstItem!.startOffset).to.equal(60);
    expect(firstItem!.endLine).to.equal(2);
    expect(firstItem!.endCharacter).to.equal(2);
    expect(firstItem!.endOffset).to.equal(60);
  });
});
