import { Buffer } from 'node:buffer';
import http from 'node:http';
import https from 'node:https';
import { type AddressInfo } from 'node:net';
import { inspect } from 'node:util';
import sinon from 'sinon';
import { assert } from 'chai';
import { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { identity } from 'ramda';

import HttpResolverAxios from '../../../../src/resolve/resolvers/http-axios/index.ts';
import ResolverError from '../../../../src/errors/ResolverError.ts';
import File from '../../../../src/File.ts';

describe('resolve', function () {
  context('resolvers', function () {
    context('HttpResolverAxios', function () {
      let resolver: any;

      beforeEach(function () {
        resolver = new HttpResolverAxios();
      });

      context('canRead', function () {
        context('given valid http URL', function () {
          specify('should consider it a HTTP URL', function () {
            assert.isTrue(resolver.canRead(new File({ uri: 'http://speclynx.com/file.txt' })));
          });
        });

        context('given valid https URL', function () {
          specify('should consider it a https URL', function () {
            assert.isTrue(resolver.canRead(new File({ uri: 'https://speclynx.com/file.txt' })));
          });
        });

        context('given URIs with no protocol', function () {
          specify('should not consider it a http/https URL', function () {
            assert.isFalse(resolver.canRead(new File({ uri: '/home/user/file.txt' })));
            assert.isFalse(resolver.canRead(new File({ uri: 'C:\\home\\user\\file.txt' })));
          });
        });

        context('given URLs with other known protocols', function () {
          specify('should not consider it a http/https URL', function () {
            assert.isFalse(resolver.canRead(new File({ uri: 'ftp://speclynx.com/' })));
          });
        });
      });

      context('read', function () {
        let axiosInstance: any;
        let axiosMock: any;

        beforeEach(function () {
          axiosInstance = resolver.getHttpClient();
          axiosMock = new MockAdapter(axiosInstance);
        });

        context('given HTTP URL', function () {
          specify('should fetch the URL', async function () {
            const url = 'https://httpbin.org/anything';

            axiosMock.onGet(url).reply(200, Buffer.from('data'));
            const content = await resolver.read(new File({ uri: url }));

            assert.isTrue(ArrayBuffer.isView(content));
            assert.strictEqual(content.toString(), 'data');
          });

          specify('should throw on unexpected status codes', async function () {
            const url = 'https://httpbin.org/anything';

            axiosMock.onGet(url).reply(400, Buffer.from('data'));

            try {
              await resolver.read(new File({ uri: url }));
              assert.fail('should throw ResolverError');
            } catch (e) {
              assert.instanceOf(e, ResolverError);
              assert.propertyVal(e, 'message', 'Error downloading "https://httpbin.org/anything"');
            }
          });

          specify('should throw on timeout', async function () {
            resolver = new HttpResolverAxios({ timeout: 1 });
            axiosInstance = resolver.getHttpClient();
            axiosMock = new MockAdapter(resolver.getHttpClient());
            const url = 'https://httpbin.org/anything';

            axiosMock.onGet(url).timeout();

            try {
              await resolver.read(new File({ uri: url }));
              assert.fail('should throw ResolverError');
            } catch (error: any) {
              assert.strictEqual(error.cause.message, 'timeout of 1ms exceeded');
              assert.instanceOf(error, ResolverError);
              assert.propertyVal(
                error,
                'message',
                'Error downloading "https://httpbin.org/anything"',
              );
            }
          });

          specify('should throw on network error', async function () {
            const url = 'https://httpbin.org/anything';

            axiosMock.onGet(url).networkError();

            try {
              await resolver.read(new File({ uri: url }));
              assert.fail('should throw ResolverError');
            } catch (error: any) {
              assert.strictEqual(error.cause.message, 'Network Error');
              assert.instanceOf(error, ResolverError);
              assert.propertyVal(
                error,
                'message',
                'Error downloading "https://httpbin.org/anything"',
              );
            }
          });

          context('given request carrying credentials', function () {
            const token = 'secret-token';
            const axiosConfig = {
              headers: { 'X-API-Key': token, 'X-Trace': 'abc' },
              auth: { username: 'user', password: token },
              httpAgent: new http.Agent(),
              httpsAgent: new https.Agent({ passphrase: token }),
            };
            let server: http.Server;
            let baseURL: string;

            const readError = async (): Promise<any> => {
              try {
                await resolver.read(new File({ uri: `${baseURL}/file.json` }));
              } catch (error: unknown) {
                return error;
              }
              return assert.fail('should throw ResolverError');
            };
            const serialize = (error: any): string =>
              inspect(error, { depth: Infinity }) + JSON.stringify(error.cause.toJSON());

            beforeEach(function (done) {
              resolver = new HttpResolverAxios({
                axiosConfig: {
                  ...axiosConfig,
                  redact: [...HttpResolverAxios.defaultRedact, 'x-api-key'],
                },
              });
              server = http.createServer((req, res) => {
                res.statusCode = 404;
                res.end('missing');
              });
              server.listen(0, () => {
                baseURL = `http://localhost:${(server.address() as AddressInfo).port}`;
                done();
              });
            });

            afterEach(function (done) {
              if (server.listening) server.close(done);
              else done();
            });

            specify('should mask them on unexpected status codes', async function () {
              const error = await readError();
              const { status, response } = error.cause;

              assert.instanceOf(error, ResolverError);
              assert.instanceOf(error.cause, AxiosError);
              assert.notInclude(serialize(error), token);
              assert.strictEqual(status, 404);
              assert.strictEqual(response.status, 404);
              assert.strictEqual(response.data.toString(), 'missing');
            });

            specify('should mask them on network error', async function () {
              await new Promise((resolve) => {
                server.close(resolve);
              });

              const error = await readError();
              const { cause } = error;

              assert.instanceOf(error, ResolverError);
              assert.notInclude(serialize(error), token);
              assert.strictEqual(cause.code, 'ECONNREFUSED');
            });

            specify('should remove the raw request', async function () {
              const { request, response } = (await readError()).cause;

              assert.isUndefined(request);
              assert.isUndefined(response.request);
            });

            specify('should keep the rest of the request config', async function () {
              const { config, response } = (await readError()).cause;

              assert.strictEqual(config.url, `${baseURL}/file.json`);
              assert.strictEqual(config.method, 'get');
              assert.strictEqual(config.timeout, 5000);
              assert.strictEqual(config.headers['X-Trace'], 'abc');
              assert.match(config.headers['X-API-Key'], /REDACTED/);
              assert.strictEqual(response.config, config);
            });

            specify('should keep the shape of the request config', async function () {
              const { config } = (await readError()).cause;

              assert.instanceOf(config.headers, AxiosHeaders);
              assert.strictEqual(config.headers.get('x-trace'), 'abc');
              assert.match(config.headers.get('x-api-key'), /REDACTED/);
            });

            specify('should mask when options are given as resolverOpts', async function () {
              // the way readFile binds resolverOpts to a resolver
              resolver = Object.assign(Object.create(new HttpResolverAxios()), {
                axiosConfig: { headers: { Authorization: `Bearer ${token}` } },
              });

              const error = await readError();

              assert.match(error.cause.config.headers.Authorization, /REDACTED/);
              assert.notInclude(serialize(error), token);
            });

            context('given no redact list', function () {
              specify('should mask the default keys', async function () {
                resolver = new HttpResolverAxios({
                  axiosConfig: {
                    ...axiosConfig,
                    headers: { Cookie: `sid=${token}`, 'Proxy-Authorization': `Basic ${token}` },
                  },
                });

                const error = await readError();
                const { config } = error.cause;

                assert.match(config.headers.Cookie, /REDACTED/);
                assert.match(config.headers['Proxy-Authorization'], /REDACTED/);
                assert.match(config.auth, /REDACTED/);
                assert.match(config.httpAgent, /REDACTED/);
                assert.match(config.httpsAgent, /REDACTED/);
                assert.notInclude(serialize(error), token);
              });

              specify('should mask the Authorization header', async function () {
                resolver = new HttpResolverAxios({
                  axiosConfig: { headers: { Authorization: `Bearer ${token}` } },
                });

                const error = await readError();

                assert.match(error.cause.config.headers.Authorization, /REDACTED/);
                assert.notInclude(serialize(error), token);
              });

              specify('should not mask keys outside the default list', async function () {
                resolver = new HttpResolverAxios({ axiosConfig });

                const error = await readError();

                assert.strictEqual(error.cause.config.headers['X-API-Key'], token);
              });
            });

            context('given redact that is not a list', function () {
              specify('should mask the default keys', async function () {
                resolver = new HttpResolverAxios({
                  axiosConfig: { headers: { Authorization: `Bearer ${token}` }, redact: undefined },
                });

                const error = await readError();

                assert.match(error.cause.config.headers.Authorization, /REDACTED/);
                assert.notInclude(serialize(error), token);
              });
            });

            context('given custom redact list', function () {
              specify('should replace the default keys', async function () {
                resolver = new HttpResolverAxios({
                  axiosConfig: {
                    headers: { Authorization: `Bearer ${token}`, 'X-API-Key': token },
                    redact: ['x-api-key'],
                  },
                });

                const { config } = (await readError()).cause;

                assert.match(config.headers['X-API-Key'], /REDACTED/);
                assert.strictEqual(config.headers.Authorization, `Bearer ${token}`);
              });
            });

            context('given empty redact list', function () {
              specify('should leave the error intact', async function () {
                resolver = new HttpResolverAxios({ axiosConfig: { ...axiosConfig, redact: [] } });

                const error = await readError();

                assert.strictEqual(error.cause.config.headers['X-API-Key'], token);
                assert.isDefined(error.cause.request);
                assert.isDefined(error.cause.response.request);
              });
            });

            context('given error that is not an Axios error', function () {
              specify('should pass it through unchanged', async function () {
                const failure = new Error('interceptor failed');
                resolver = new HttpResolverAxios({
                  axiosConfig: {
                    interceptors: {
                      request: [
                        () => {
                          throw failure;
                        },
                      ],
                    } as any,
                  },
                });

                const error = await readError();

                assert.instanceOf(error, ResolverError);
                assert.strictEqual(error.cause, failure);
              });
            });

            specify('should expose immutable default redact list', function () {
              assert.isFrozen(HttpResolverAxios.defaultRedact);
            });
          });

          context('given withCredentials option', function () {
            specify('should allow cross-site Access-Control requests', async function () {
              resolver = new HttpResolverAxios({ withCredentials: true });
              axiosInstance = resolver.getHttpClient();
              axiosMock = new MockAdapter(axiosInstance);
              const url = 'https://httpbin.org/anything';

              axiosMock.onGet(url).reply((config: AxiosRequestConfig) => {
                assert.isTrue(config.withCredentials);
                return [200, Buffer.from('data')];
              });
              await resolver.read(new File({ uri: url }));
            });
          });

          context('given redirects options', function () {
            specify('should throw on exceeding redirects', function (done) {
              resolver = new HttpResolverAxios({ redirects: 0 });
              axiosInstance = resolver.getHttpClient();
              const server = http.createServer((req, res) => {
                res.setHeader('Location', '/foo');
                res.statusCode = 302;
                res.end();
              });

              server.listen(4444, () => {
                axiosInstance
                  .get('http://localhost:4444/')
                  .catch((error: any) => {
                    assert.strictEqual(error.response.status, 302);
                    assert.strictEqual(error.response.headers.location, '/foo');
                  })
                  .catch(identity)
                  .then((error: any) => {
                    server.close();
                    done(error);
                  });
              });
            });
          });

          context('given cache option', function () {
            context('given cache is false (default)', function () {
              specify('should not cache responses', async function () {
                resolver = new HttpResolverAxios();
                axiosInstance = resolver.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url = 'https://httpbin.org/anything';
                let callCount = 0;

                axiosMock.onGet(url).reply(() => {
                  callCount += 1;
                  return [200, Buffer.from('data')];
                });

                await resolver.read(new File({ uri: url }));
                await resolver.read(new File({ uri: url }));

                assert.strictEqual(callCount, 2);
              });
            });

            context('given cache is true', function () {
              specify('should cache responses', async function () {
                resolver = new HttpResolverAxios({ cache: true });
                axiosInstance = resolver.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url = 'https://httpbin.org/anything';
                let callCount = 0;

                axiosMock.onGet(url).reply(() => {
                  callCount += 1;
                  return [200, Buffer.from('data')];
                });

                const first = await resolver.read(new File({ uri: url }));
                const second = await resolver.read(new File({ uri: url }));

                assert.strictEqual(callCount, 1);
                assert.strictEqual(first.toString(), 'data');
                assert.strictEqual(second.toString(), 'data');
              });
            });

            context('given cache is enabled with defaults', function () {
              specify('should cache responses', async function () {
                resolver = new HttpResolverAxios({ cache: {} });
                axiosInstance = resolver.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url = 'https://httpbin.org/anything';
                let callCount = 0;

                axiosMock.onGet(url).reply(() => {
                  callCount += 1;
                  return [200, Buffer.from('data')];
                });

                const first = await resolver.read(new File({ uri: url }));
                const second = await resolver.read(new File({ uri: url }));

                assert.strictEqual(callCount, 1);
                assert.strictEqual(first.toString(), 'data');
                assert.strictEqual(second.toString(), 'data');
              });
            });

            context('given cache is enabled with custom maxEntries', function () {
              specify('should evict oldest entry when maxEntries is exceeded', async function () {
                resolver = new HttpResolverAxios({ cache: { maxEntries: 1 } });
                axiosInstance = resolver.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url1 = 'https://httpbin.org/anything/1';
                const url2 = 'https://httpbin.org/anything/2';
                let callCount1 = 0;
                let callCount2 = 0;

                axiosMock.onGet(url1).reply(() => {
                  callCount1 += 1;
                  return [200, Buffer.from('data1')];
                });
                axiosMock.onGet(url2).reply(() => {
                  callCount2 += 1;
                  return [200, Buffer.from('data2')];
                });

                await resolver.read(new File({ uri: url1 }));
                assert.strictEqual(callCount1, 1);

                // this should evict url1 since maxEntries is 1
                await resolver.read(new File({ uri: url2 }));
                assert.strictEqual(callCount2, 1);

                // url1 should require a new fetch
                await resolver.read(new File({ uri: url1 }));
                assert.strictEqual(callCount1, 2);
              });
            });

            context('given cache is enabled with custom maxStaleAge', function () {
              specify('should evict stale entries on read', async function () {
                const clock = sinon.useFakeTimers();

                try {
                  resolver = new HttpResolverAxios({ cache: { maxStaleAge: 1000 } });
                  axiosInstance = resolver.getHttpClient();
                  axiosMock = new MockAdapter(axiosInstance);
                  const url = 'https://httpbin.org/anything';
                  let callCount = 0;

                  axiosMock.onGet(url).reply(() => {
                    callCount += 1;
                    return [200, Buffer.from('data')];
                  });

                  await resolver.read(new File({ uri: url }));
                  assert.strictEqual(callCount, 1);

                  // advance time past maxStaleAge
                  clock.tick(1001);

                  // stale entry should be evicted, triggering a new fetch
                  await resolver.read(new File({ uri: url }));
                  assert.strictEqual(callCount, 2);
                } finally {
                  clock.restore();
                }
              });
            });

            context('given cache is enabled via resolverOpts', function () {
              specify('should activate caching', async function () {
                resolver = new HttpResolverAxios();

                // simulate resolverOpts applied via Object.create + Object.assign
                const clonedResolver = Object.create(resolver);
                Object.assign(clonedResolver, { cache: true });

                axiosInstance = clonedResolver.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url = 'https://httpbin.org/anything';
                let callCount = 0;

                axiosMock.onGet(url).reply(() => {
                  callCount += 1;
                  return [200, Buffer.from('data')];
                });

                const first = await clonedResolver.read(new File({ uri: url }));
                const second = await clonedResolver.read(new File({ uri: url }));

                assert.strictEqual(callCount, 1);
                assert.strictEqual(first.toString(), 'data');
                assert.strictEqual(second.toString(), 'data');
              });

              specify('should share cache across clones', async function () {
                resolver = new HttpResolverAxios();
                const url = 'https://httpbin.org/anything';
                let callCount = 0;

                // first clone: fetches and caches
                const clone1 = Object.create(resolver);
                Object.assign(clone1, { cache: true });
                axiosInstance = clone1.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);

                axiosMock.onGet(url).reply(() => {
                  callCount += 1;
                  return [200, Buffer.from('data')];
                });

                await clone1.read(new File({ uri: url }));
                assert.strictEqual(callCount, 1);

                // second clone: should serve from shared cache on base resolver
                const clone2 = Object.create(resolver);
                Object.assign(clone2, { cache: true });
                await clone2.read(new File({ uri: url }));
                assert.strictEqual(callCount, 1);
              });

              specify('should override maxEntries from resolverOpts', async function () {
                resolver = new HttpResolverAxios({ cache: true });

                const clone = Object.create(resolver);
                Object.assign(clone, { cache: { maxEntries: 1 } });

                axiosInstance = clone.getHttpClient();
                axiosMock = new MockAdapter(axiosInstance);
                const url1 = 'https://httpbin.org/anything/1';
                const url2 = 'https://httpbin.org/anything/2';
                let callCount1 = 0;

                axiosMock.onGet(url1).reply(() => {
                  callCount1 += 1;
                  return [200, Buffer.from('data1')];
                });
                axiosMock.onGet(url2).reply(() => [200, Buffer.from('data2')]);

                await clone.read(new File({ uri: url1 }));
                assert.strictEqual(callCount1, 1);

                // evicts url1 since maxEntries is 1
                await clone.read(new File({ uri: url2 }));

                // url1 should require a new fetch
                await clone.read(new File({ uri: url1 }));
                assert.strictEqual(callCount1, 2);
              });
            });
          });
        });
      });
    });
  });
});
