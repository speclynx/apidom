import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Benchmark from 'benchmark';
import type { Deferred } from 'benchmark';

import analyze from '../../src/lexical-analysis/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures/data.json');
const source = fs.readFileSync(fixturePath).toString();

const options = {
  name: 'lexical-analysis',
  defer: true,
  minSamples: 20,
  expected: '1,612 ops/sec ±0.96% (102 runs sampled)',
  async fn(deferred: Deferred) {
    const tree = await analyze(source);
    tree.delete();
    deferred.resolve();
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
