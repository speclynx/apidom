import { expect } from 'chai';
import dedent from 'dedent';
import { SourceMapElement } from '@speclynx/apidom-datamodel';
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
    const schemas = components?.schemas;
    const isComponentsSchemas = schemas?.classes.includes('components-schemas');

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
    const sourceMap = infoValue?.meta.get('sourceMap') as SourceMapElement | undefined;
    const positionStart = sourceMap?.positionStart;
    const positionEnd = sourceMap?.positionEnd;
    const expectedPosition = [1, 5, 20];

    expect(sourceMap).to.be.an.instanceof(SourceMapElement);
    expect(positionStart?.equals(expectedPosition)).to.be.true;
    expect(positionEnd?.equals(expectedPosition)).to.be.true;
  });
});
