import { omit } from 'ramda';
import { ensureArray } from 'ramda-adjunct';
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

  protected memoryCache: MemoryCache<Buffer> | undefined;

  constructor(options?: HTTPResolverAxiosOptions) {
    const { axiosConfig = {}, ...rest } = options ?? {};

    super({ ...rest, name: 'http-axios' });
    this.axiosConfig = axiosConfig;

    if (this.cache !== false) {
      this.memoryCache = new MemoryCache(this.cache === true ? {} : this.cache);
    }
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

  async read(file: File): Promise<Buffer> {
    const uri = url.stripHash(file.uri);

    // serve from cache if available
    const cached = this.memoryCache?.get(uri);
    if (cached !== undefined) {
      return cached;
    }

    const client: AxiosInstance = this.getHttpClient();

    try {
      const response = await client.get<Buffer>(uri);

      // store in cache if caching is enabled
      this.memoryCache?.set(uri, response.data);

      return response.data;
    } catch (error: unknown) {
      throw new ResolverError(`Error downloading "${file.uri}"`, { cause: error });
    }
  }
}

export default HTTPResolverAxios;
