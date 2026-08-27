/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */

export type AnyObject = Record<string, unknown>

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequestConfig {
  method?: HTTPMethod
  url?: string
  baseURL?: string
  data?: AnyObject | FormData
  params?: Record<string, unknown>
  headers?: Record<string, string>
  signal?: AbortSignal
  credentials?: RequestCredentials
}

export interface HttpResponse<T = unknown> {
  data: T
  status: number
  headers: Headers | Record<string, string>
}

export interface ResourceActionDescription {
  url: string
  method: HTTPMethod
  params?: readonly string[]
  skipAuthRefresh?: boolean
}

export type ResourceAction = Record<string, ResourceActionDescription>

export interface IResource {
  name: string
  prefix: string
  resources: ResourceAction
  baseURL?: string
}

export interface Pageable<T> {
  items: T[]
  count: number
  previousPage?: number
  nextPage?: number
}

export interface IPaginated<T> {
  items: T[]
  page: number
  pages: number
  size: number
  total: number
  onPageChange?: (page: number) => void
}

export interface EntityTimestamp {
  createdAt?: string
  updatedAt?: string
}

export interface IMiddleware {
  beforeRequest?: (resource: IResource, action: ResourceActionDescription, config: HttpRequestConfig) => Promise<void> | void
  afterRequest?: (response: HttpResponse, action: ResourceActionDescription, resource: IResource) => Promise<void> | void
}

export interface HttpCallOptions {
  headers?: Record<string, string>
  signal?: AbortSignal
  request?: HttpRequestConfig
}

export interface IRepository {
  call: <T = unknown>(
    name: string,
    action: string,
    params?: AnyObject,
    body?: AnyObject | FormData,
    options?: HttpCallOptions,
  ) => Promise<HttpResponse<T>>
}

export type MappingSkeletonFunction = (item: AnyObject) => unknown

export type MappingSkeleton = {
  [key: string]: string | MappingSkeletonFunction | MappingSkeleton
}
