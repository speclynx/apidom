import { omit } from 'ramda';
import { ensureArray, isPlainObject } from 'ramda-adjunct';
import axios, { Axios, AxiosInstance, CreateAxiosDefaults } from 'axios';

import HTTPResolver, { HTTPResolverOptions } from '../HTTPResolver.ts';
import MemoryCache from './cache/MemoryCache.ts';
import File from '../../../File.ts';
import ResolverError from '../../../errors/ResolverError.ts';
import * as url from '../../../util/url.ts';

export type {
  default as HTTPResolver,
  HTTPResolverOptions,
  CacheOptions,
} from '../HTTPResolver.ts';
export type { default as Resolver, ResolverOptions } from '../Resolver.ts';
export type { default as File, FileOptions } from '../../../File.ts';

/**
 * @public
 */
export interface HTTPResolverAxiosConfig extends CreateAxiosDefaults {
  interceptors?: Axios['interceptors'];
}

/**
 * @public
 */
export interface HTTPResolverAxiosOptions extends Omit<HTTPResolverOptions, 'name'> {
  readonly axiosConfig?: HTTPResolverAxiosConfig;
}

/**
 * @public
 */
class HTTPResolverAxios extends HTTPResolver {
  public axiosConfig: HTTPResolverAxiosConfig = {};

  protected axiosInstance!: AxiosInstance;

  protected previousAxiosConfig!: HTTPResolverAxiosConfig;

  protected cacheStore: MemoryCache<Buffer>;

  protected previousCache!: typeof this.cache;

  constructor(options?: HTTPResolverAxiosOptions) {
    const { axiosConfig = {}, ...rest } = options ?? {};

    super({ ...rest, name: 'http-axios' });
    this.axiosConfig = axiosConfig;
    this.cacheStore = new MemoryCache(isPlainObject(this.cache) ? this.cache : {});
  }

  getHttpClient(): AxiosInstance {
    if (this.axiosInstance === undefined || this.previousAxiosConfig !== this.axiosConfig) {
      const config = omit(['interceptors'], this.axiosConfig);
      const { interceptors } = this.axiosConfig;

      this.axiosInstance = axios.create({
        timeout: this.timeout,
        maxRedirects: this.redirects,
        withCredentials: this.withCredentials,
        responseType: 'arraybuffer',
        ...config,
      });

      // settings up request interceptors
      if (Array.isArray(interceptors?.request)) {
        interceptors.request.forEach((requestInterceptor) => {
          this.axiosInstance.interceptors.request.use(...ensureArray(requestInterceptor));
        });
      }

      // settings up response interceptors
      if (Array.isArray(interceptors?.response)) {
        interceptors.response.forEach((responseInterceptor: any) => {
          this.axiosInstance.interceptors.response.use(...ensureArray(responseInterceptor));
        });
      }

      this.previousAxiosConfig = this.axiosConfig;
    }

    return this.axiosInstance;
  }

  /**
   * Ensures cacheStore is config-isolated for cloned resolvers.
   * When a resolver is cloned via Object.create (in readFile), the clone inherits
   * cacheStore from the prototype. Object.create(cacheStore) creates a view that
   * shares the underlying store Map but allows isolated config (maxEntries, maxStaleAge)
   * via own properties set by Object.assign.
   */
  protected getCacheStore(): MemoryCache<Buffer> {
    if (this.previousCache !== this.cache) {
      if (!Object.hasOwn(this, 'cacheStore')) {
        this.cacheStore = Object.create(this.cacheStore) as MemoryCache<Buffer>;
      }
      if (isPlainObject(this.cache)) {
        Object.assign(this.cacheStore, this.cache);
      }

      this.previousCache = this.cache;
    }

    return this.cacheStore;
  }

  async read(file: File): Promise<Buffer> {
    const uri = url.stripHash(file.uri);
    const cacheStore = this.cache ? this.getCacheStore() : undefined;

    // return cached content if available
    const cached = cacheStore?.get(uri);
    if (cached !== undefined) return cached;

    const client: AxiosInstance = this.getHttpClient();

    try {
      const response = await client.get<Buffer>(uri);
      cacheStore?.set(uri, response.data);
      return response.data;
    } catch (error: unknown) {
      throw new ResolverError(`Error downloading "${file.uri}"`, { cause: error });
    }
  }
}

export default HTTPResolverAxios;
