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

export function expiresAt(token: string | null | undefined): number | null {
  if (!token) return null

  const [, payload] = token.split('.')

  if (!payload) return null

  const claims = decode(payload)
  const exp = claims?.exp

  return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null
}

export function isExpired(token: string | null | undefined, skewMs = 5000, now = Date.now()): boolean {
  const at = expiresAt(token)

  return at !== null && at - skewMs <= now
}
