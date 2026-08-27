import type { AnyObject } from '~/shared/contracts/data'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IModel<M> {
  get: <K extends keyof M>(key: K) => M[K]
}

export abstract class Model<M = unknown> implements IModel<M> {
  protected properties: M

  public constructor(payload: M) {
    this.properties = payload
    Object.assign(this, payload)
  }

  public get<K extends keyof M>(key: K): M[K] {
    return this.properties[key]
  }

  public toObject(): M {
    return this.properties
  }

  protected static mapRaw(raw: unknown): unknown {
    return raw
  }

  public static fromRaw<TModel extends Model, TRaw = unknown, TMapped = unknown>(
    this: new (props: TMapped) => TModel,
    raw: TRaw,
  ): TModel {
    const mapped = (this as unknown as { mapRaw: (raw: TRaw) => TMapped }).mapRaw(raw)
    return new this(mapped)
  }

  protected static snakeToCamelObject<T = AnyObject>(raw: AnyObject): T {
    const result: AnyObject = {}

    for (const [key, value] of Object.entries(raw)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())
      result[camelKey] = value
    }

    return result as T
  }
}
