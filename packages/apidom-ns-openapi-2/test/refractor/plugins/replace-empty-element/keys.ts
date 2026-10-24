import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractorPluginReplaceEmptyElement, refractSwagger } from '../../../../src/index.ts';

// https://github.com/speclynx/apidom/issues/694
describe('given empty key in a map of semantic elements', function () {
  it('should not replace the key with semantic element', async function () {
    const yamlDefinition = dedent`
      swagger: '2.0'
      definitions:
        : {type: string}
    `;
    const apiDOM = await parse(yamlDefinition);
    const element = refractSwagger(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    assert.deepEqual((toValue(element) as any).definitions, { '': { type: 'string' } });
  });
});
