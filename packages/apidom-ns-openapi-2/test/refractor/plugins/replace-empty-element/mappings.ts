import { expect } from 'chai';
import dedent from 'dedent';
import { includesClasses, hasElementSourceMap } from '@speclynx/apidom-datamodel';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import {
  refractorPluginReplaceEmptyElement,
  refractSwagger,
  SwaggerElement,
} from '../../../../src/index.ts';

describe('given empty value instead of InfoElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          info:
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of ContactElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          info:
            contact:
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for Operation.parameters', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          paths:
            /path:
              get:
                parameters:
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result!, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as SwaggerElement;
    const isOperationParameters = includesClasses(
      (swaggerElement as any).get('paths').get('/path').get('get').get('parameters'),
      ['operation-parameters'],
    );

    expect(sexprs(swaggerElement)).toMatchSnapshot();
    expect(isOperationParameters).to.be.true;
  });
});

describe('given empty value instead for Swagger.definitions.Schema1', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          definitions:
            Schema1:
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as SwaggerElement;

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given empty value instead for Schema.properties.*', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          definitions:
            User:
              properties:
                firstName:
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as SwaggerElement;

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given OpenAPI definition with no empty values', function () {
  it('should do nothing', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          info: {}
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as SwaggerElement;

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given OpenAPI definition with empty values', function () {
  it('should generate proper source maps', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          info:
        `;
    const apiDOM = await parse(yamlDefinition, { sourceMap: true });
    const swaggerElement = refractSwagger(apiDOM.result!, {
      plugins: [refractorPluginReplaceEmptyElement()],
    }) as SwaggerElement;
    const { info: infoValue } = swaggerElement;

    expect(hasElementSourceMap(infoValue!)).to.be.true;
    expect(infoValue!.startLine).to.equal(1);
    expect(infoValue!.startCharacter).to.equal(5);
    expect(infoValue!.startOffset).to.equal(20);
    expect(infoValue!.endLine).to.equal(1);
    expect(infoValue!.endCharacter).to.equal(5);
    expect(infoValue!.endOffset).to.equal(20);
  });
});
