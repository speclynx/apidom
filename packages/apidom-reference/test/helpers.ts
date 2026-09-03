import fs from 'node:fs';
import http, { Server } from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { assert } from 'chai';
import { ParseResultElement, isParseResultElement } from '@speclynx/apidom-datamodel';

export type ServerTerminable = Server & {
  terminate: () => Promise<ServerTerminable>;
};

export const loadFile = (uri: string) => fs.readFileSync(uri).toString();

export const loadJsonFile = (uri: string) => JSON.parse(loadFile(uri));

export const createHTTPServer = ({ port = 8123, cwd = process.cwd() } = {}): ServerTerminable => {
  const server: ServerTerminable = http.createServer((req, res) => {
    const filePath = path.join(cwd, req.url || '/favicon.ico');

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const data = fs.readFileSync(filePath).toString();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  }) as ServerTerminable;

  server.listen(port);

  server.terminate = () =>
    new Promise((resolve) => {
      server.close(() => resolve(server));
    });

  return server;
};

/**
 * Asserts that a source description result stands for a document already
 * processed elsewhere (a shared dependency, not a cycle) and points at the
 * result where it was processed.
 */
export const assertSharedSourceDescription = (
  shared: ParseResultElement,
  canonical: ParseResultElement,
  verb: 'parsed' | 'dereferenced',
) => {
  assert.isTrue(isParseResultElement(shared));
  assert.isTrue(shared.classes.includes('source-description'));
  assert.strictEqual(shared.meta.get('retrievalURI'), canonical.meta.get('retrievalURI'));
  assert.isUndefined(shared.api); // not processed again
  assert.strictEqual(shared.warnings.length, 0); // not a cycle
  assert.strictEqual(shared.meta.get('parseResult'), canonical);

  const annotation = shared.get(0);
  assert.strictEqual(annotation?.element, 'annotation');
  assert.isTrue(annotation?.classes.includes('info'));
  assert.include(annotation?.toValue(), `has already been ${verb}`);
};

/**
 * Asserts that a source description result was skipped because it
 * references a document still being processed higher up the chain.
 */
export const assertCyclicSourceDescription = (cyclic: ParseResultElement) => {
  assert.isTrue(isParseResultElement(cyclic));
  assert.isUndefined(cyclic.api);
  assert.isUndefined(cyclic.meta.get('parseResult'));

  const annotation = cyclic.get(0);
  assert.strictEqual(annotation?.element, 'annotation');
  assert.isTrue(annotation?.classes.includes('warning'));
  assert.include(annotation?.toValue(), 'has already been visited');
};
