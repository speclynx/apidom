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

describe('given empty value for field additionalItems', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          additionalItems:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given empty value for field patternProperties', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          patternProperties:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given empty value for field enum', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          enum:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given empty value for properties field', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          properties:
            prop1:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given empty value for LinkDescription.targetSchema field', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          links:
            - targetSchema:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given empty value for LinkDescription.schema field', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          links:
            - schema:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;

    expect(sexprs(jsonSchemaElement)).toMatchSnapshot();
  });
});

describe('given JSON Schema definition with no empty values', function () {
  it('should do nothing', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-04/schema#'
          properties:
            prop1: {}
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
          properties:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;
    const { properties: propertiesValue } = jsonSchemaElement;

    expect(hasElementSourceMap(propertiesValue!)).to.be.true;
    expect(propertiesValue!.startLine).to.equal(1);
    expect(propertiesValue!.startCharacter).to.equal(11);
    expect(propertiesValue!.startOffset).to.equal(62);
    expect(propertiesValue!.endLine).to.equal(1);
    expect(propertiesValue!.endCharacter).to.equal(11);
    expect(propertiesValue!.endOffset).to.equal(62);
  });
});
