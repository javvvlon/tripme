import { ofetch } from 'ofetch'
import type { FetchOptions } from 'ofetch'
import type {
  AnyObject,
  HttpCallOptions,
  HttpRequestConfig,
  HttpResponse,
  IMiddleware,
  IResource,
} from '~/shared/contracts/data'
import { findAction, findResource, replaceVariables } from './helpers'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class HttpConnector {
  private baseConfig: HttpRequestConfig
  private resources: IResource[] = []
  private middlewares: IMiddleware[] = []
  private unauthorizedHandler: (() => Promise<boolean>) | null = null

  constructor(config: HttpRequestConfig = {}) {
    this.baseConfig = config
  }

  async call<ResponseBody = unknown>(
    resourceName: string,
    actionName: string,
    params: AnyObject = {},
    body?: AnyObject | FormData,
    opts?: HttpCallOptions,
  ): Promise<HttpResponse<ResponseBody>> {
    return this.request<ResponseBody>(resourceName, actionName, params, body, opts, false)
  }

  private async request<ResponseBody = unknown>(
    resourceName: string,
    actionName: string,
    params: AnyObject,
    body: AnyObject | FormData | undefined,
    opts: HttpCallOptions | undefined,
    isRetry: boolean,
  ): Promise<HttpResponse<ResponseBody>> {
    const resource = findResource(resourceName, this.resources)
    const action = findAction(actionName, resource)

    const { url: urlPart, filteredParams } = replaceVariables(action.url, params, action.params)

    const prefix = (resource.prefix || '').replace(/\/+$/g, '')
    const finalUrl = (prefix ? `${prefix}/${urlPart}` : `/${urlPart}`).replace(/\/{2,}/g, '/')

    const config: HttpRequestConfig = {
      ...this.baseConfig,
      ...(opts?.request ?? {}),
      method: action.method,
      url: finalUrl,
      baseURL: resource.baseURL ?? this.baseConfig.baseURL,
      data: body,
      params: filteredParams,
      headers: { ...(this.baseConfig.headers ?? {}), ...(opts?.headers ?? {}) },
      signal: opts?.signal,
    }

    for (const mw of this.middlewares) {
      await mw.beforeRequest?.(resource, action, config)
    }

    const options: FetchOptions<'json'> = {
      method: config.method,
      baseURL: config.baseURL,
      query: config.params,
      headers: config.headers,
      signal: config.signal,
      credentials: config.credentials,
      body: config.method === 'GET' || config.method === 'DELETE' ? undefined : config.data,
    }

    try {
      const raw = await ofetch.raw<ResponseBody>(config.url!, options)

      const response: HttpResponse<ResponseBody> = {
        data: raw._data as ResponseBody,
        status: raw.status,
        headers: raw.headers,
      }

      for (const mw of this.middlewares) {
        await mw.afterRequest?.(response, action, resource)
      }

      return response
    }
    catch (err: unknown) {
      const e = err as { response?: { status: number, _data?: unknown, headers?: Headers } }

      if (
        e.response?.status === 401
        && this.unauthorizedHandler
        && !isRetry
        && !action.skipAuthRefresh
      ) {
        const recovered = await this.unauthorizedHandler()

        if (recovered) {
          return this.request<ResponseBody>(resourceName, actionName, params, body, opts, true)
        }
      }

      if (e.response) {
        throw {
          data: e.response._data,
          status: e.response.status,
          headers: e.response.headers ?? {},
        } satisfies HttpResponse
      }

      throw err
    }
  }

  registerResource(resource: IResource | IResource[]): void {
    if (Array.isArray(resource)) this.resources.push(...resource)
    else this.resources.push(resource)
  }

  registerUnauthorizedHandler(handler: (() => Promise<boolean>) | null): void {
    this.unauthorizedHandler = handler
  }

  registerMiddleware(mw: IMiddleware | IMiddleware[]): void {
    if (Array.isArray(mw)) this.middlewares.push(...mw)
    else this.middlewares.push(mw)
  }

  unregisterResource(resource: IResource): void {
    const i = this.resources.indexOf(resource)
    if (i >= 0) this.resources.splice(i, 1)
  }

  listResourceNames(): string[] {
    return this.resources.map(r => r.name)
  }

  listActionNames(resourceName: string): string[] {
    return Object.keys(findResource(resourceName, this.resources).resources)
  }
}
