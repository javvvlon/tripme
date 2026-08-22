/**
 * Stub. In production this hands off to tripme_api rather than storing
 * anything here — §3.5 rule 2: only tripme_api writes to Postgres.
 *
 *   await $fetch('/agent-applications', {
 *     baseURL: useRuntimeConfig().public.apiBase,
 *     method: 'POST', body,
 *   })
 *
 * Note the PII rule from §7.4: name and contact are personal data of an
 * Uzbek resident. They belong in one clearly identified table, never in
 * logs, and under a retention policy.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; phone?: string; agree?: boolean }>(event)

  if (!body?.name?.trim() || !body?.phone?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'name and phone are required' })
  }
  if (!body.agree) {
    throw createError({ statusCode: 400, statusMessage: 'consent is required' })
  }

  // Deliberately not logging the body — see the PII note above.
  console.info('[apply] new agent application received')

  return { ok: true }
})
