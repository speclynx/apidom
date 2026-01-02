import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractorPluginReplaceEmptyElement, refractSwagger } from '../../../../src/index.ts';

describe('given empty value instead of SecurityRequirementElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          security:
           -
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given empty value instead of TagElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          tags:
           -
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given multiple empty values instead of ParameterElement', function () {
  it('should replace empty values with semantic elements', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          paths:
           /path:
            parameters:
              -
              -

        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});

describe('given empty values instead of SchemaElement for allOf keyword', function () {
  it('should replace empty values with semantic elements', async function () {
    const yamlDefinition = dedent`
          swagger: "2.0"
          definitions:
            Schema1:
              allOf:
               -
        `;
    const apiDOM = await parse(yamlDefinition);
    const swaggerElement = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(swaggerElement)).toMatchSnapshot();
  });
});
