import { expect } from 'chai';
import dedent from 'dedent';
import { sexprs } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractorPluginReplaceEmptyElement, refractOverlay1 } from '../../../../src/index.ts';

describe('given empty value instead of ActionElement', function () {
  it('should replace empty value with semantic element', async function () {
    const yamlDefinition = dedent`
      overlay: 1.1.0
      actions:
       -
    `;
    const apiDOM = await parse(yamlDefinition);
    const overlay1Element = refractOverlay1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(overlay1Element)).toMatchSnapshot();
  });
});

describe('given multiple empty values instead of ActionElement', function () {
  it('should replace empty values with semantic elements', async function () {
    const yamlDefinition = dedent`
      overlay: 1.1.0
      actions:
       -
       -
    `;
    const apiDOM = await parse(yamlDefinition);
    const overlay1Element = refractOverlay1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    expect(sexprs(overlay1Element)).toMatchSnapshot();
  });
});
