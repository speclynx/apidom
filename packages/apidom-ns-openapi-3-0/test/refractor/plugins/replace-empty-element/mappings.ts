import { expect } from 'chai';
import dedent from 'dedent';
import { includesClasses, hasElementSourceMap, ObjectElement } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  refract,
  OpenApi3_0Element,
} from '../../../../src/index.ts';

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          info:
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(openApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of ContactElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          info:
            contact:
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(openApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for OpenAPI.components.schemas', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          components:
            schemas:
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as OpenApi3_0Element;
    const components = openApiElement.components;
    const schemas = components?.schemas as ObjectElement;
    const isComponentsSchemas = includesClasses(schemas, ['components-schemas']);

    expect(sexprs(openApiElement)).toMatchSnapshot();
    expect(isComponentsSchemas).to.be.true;
  });
});

describe('given empty value instead for OpenAPI.components.schemas.*', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          components:
            schemas:
              Schema1:
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as OpenApi3_0Element;

    expect(sexprs(openApiElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for Schema.properties.*', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          components:
            schemas:
              User:
                properties:
                  firstName:
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as OpenApi3_0Element;

    expect(sexprs(openApiElement)).toMatchSnapshot();
  });
});

describe('given OpenAPI definition with no empty values', function () {
  it('should do nothing', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          info: {}
        `;
    const apiDOM = await parse(yamlDefinition);
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as OpenApi3_0Element;

    expect(sexprs(openApiElement)).toMatchSnapshot();
  });
});

describe('given OpenAPI definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          openapi: 3.0.4
          info:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const openApiElement = refract(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as OpenApi3_0Element;
    const { info: infoValue } = openApiElement;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(20);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(20);
  });
});
