import { Buffer } from 'node:buffer';
import http from 'node:http';
import { assert } from 'chai';
import { AxiosRequestConfig } from 'axios';
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
          });
        });
      });
    });
  });
});
