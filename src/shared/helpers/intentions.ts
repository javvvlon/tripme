/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export abstract class Intention<T extends object> {
  protected abstract map: { [K in keyof T]?: string }

  public toRequest(data: T): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    ;(Object.keys(data) as (keyof T)[]).forEach((key) => {
      const apiKey = this.map[key] ?? String(key)
      result[apiKey] = data[key]
    })

    return result
  }
}
