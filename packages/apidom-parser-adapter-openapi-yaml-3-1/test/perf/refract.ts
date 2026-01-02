import fs from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import type { Event } from 'benchmark';
import { fileURLToPath } from 'node:url';
import { ObjectElement } from '@speclynx/apidom-datamodel';
import { refractOpenApi3_1 } from '@speclynx/apidom-ns-openapi-3-1';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures/openapi.json');
const source = fs.readFileSync(fixturePath).toString();
const pojo = JSON.parse(source);
const genericObjectElement = new ObjectElement(pojo);

const options = {
  name: 'refract',
  minSamples: 600,
  expected: '55.02 ops/sec ±1.39% (651 runs sampled)',
  fn() {
    refractOpenApi3_1(genericObjectElement);
  },
};

export default options;

// we're running as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  const bench = new Benchmark({
    ...options,
    onComplete(event: Event) {
      console.info(String(event.target));
    },
    onError(event: Event) {
      console.error(event);
    },
  });
  bench.run();
}
