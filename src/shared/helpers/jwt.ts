/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const decode = (segment: string): Record<string, unknown> | null => {
  try {
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded.padEnd(padded.length + (4 - padded.length % 4) % 4, '='))

    return JSON.parse(json) as Record<string, unknown>
  }
  catch {
    return null
  }
}

/**
 * When a token stops being accepted, in milliseconds.
 *
 * Read, never trusted: the server decides what is valid. This only says when
 * it is worth asking for a new one rather than sending a request that is
 * certain to come back refused.
 *
 * `null` means the token said nothing useful — treated as "cannot tell",
 * which lets the request go ahead rather than logging someone out on a guess.
 */
export function expiresAt(token: string | null | undefined): number | null {
  if (!token) return null

  const [, payload] = token.split('.')

  if (!payload) return null

  const claims = decode(payload)
  const exp = claims?.exp

  return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null
}

/** Counts a token as spent slightly early, so it cannot lapse mid-flight. */
export function isExpired(token: string | null | undefined, skewMs = 5000, now = Date.now()): boolean {
  const at = expiresAt(token)

  return at !== null && at - skewMs <= now
}
