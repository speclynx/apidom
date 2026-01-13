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
          $schema: 'http://json-schema.org/draft-07/schema#'
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
          $schema: 'http://json-schema.org/draft-07/schema#'
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
          $schema: 'http://json-schema.org/draft-07/schema#'
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

describe('given empty value for field examples', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-07/schema#'
          examples:
        `;
    const apiDOM = await parse(yamlDefinition);
    const jsonSchema = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(jsonSchema)).toMatchSnapshot();
  });
});

describe('given empty value for LinkDescription.templateRequired field', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          $schema: 'http://json-schema.org/draft-07/schema#'
          links:
            - templateRequired:
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
          $schema: 'http://json-schema.org/draft-07/schema#'
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
          $schema: 'http://json-schema.org/draft-07/schema#'
          oneOf:
           -
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const jsonSchemaElement = refractJSONSchema(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as JSONSchemaElement;
    const { oneOf: oneOfValue } = jsonSchemaElement;
    const oneOfItem = oneOfValue?.get(0);

    expect(hasElementSourceMap(oneOfValue!)).to.be.true;
    expect(hasElementSourceMap(oneOfItem!)).to.be.true;
    expect(oneOfItem!.startLine).to.equal(2);
    expect(oneOfItem!.startCharacter).to.equal(2);
    expect(oneOfItem!.startOffset).to.equal(60);
    expect(oneOfItem!.endLine).to.equal(2);
    expect(oneOfItem!.endCharacter).to.equal(2);
    expect(oneOfItem!.endOffset).to.equal(60);
  });
});
