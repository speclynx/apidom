import { assert } from 'chai';
import dedent from 'dedent';
import { toValue } from '@speclynx/apidom-core';
import { parse } from '@speclynx/apidom-parser-adapter-yaml-1-2';

import { refractorPluginReplaceEmptyElement, refractOpenApi3_1 } from '../../../../src/index.ts';

// https://github.com/speclynx/apidom/issues/694
describe('given empty key in a map of semantic elements', function () {
  it('should not replace the key with semantic element', async function () {
    const yamlDefinition = dedent`
      openapi: 3.1.0
      components:
        schemas:
          : {type: string}
    `;
    const apiDOM = await parse(yamlDefinition);
    const element = refractOpenApi3_1(apiDOM.result, {
      plugins: [refractorPluginReplaceEmptyElement()],
    });

    assert.deepEqual((toValue(element) as any).components.schemas, { '': { type: 'string' } });
  });
});
