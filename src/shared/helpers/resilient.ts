/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export async function withRetry<T>(work: () => Promise<T>, attempts = 2, pauseMs = 600): Promise<T> {
  let last: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await work()
    }
    catch (error) {
      last = error

      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, pauseMs))
    }
  }

  throw last
}

export function failRenderOnServer(error: unknown): void {
  if (import.meta.server && error) {
    throw createError({ statusCode: 503, statusMessage: 'Content is temporarily unavailable', fatal: true })
  }
}
