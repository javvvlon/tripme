import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const b64 = path => readFileSync(path).toString('base64')

const html = readFileSync('docs/leads-orders.source.html', 'utf8')
  .replace('__FONT_B64__', b64('public/fonts/vag-rounded-bold.otf'))
  .replace(/__LOGO_LIGHT_B64__/g, b64('public/brand/tripme-logo-light.svg'))
  .replace(/__MARK_B64__/g, b64('public/brand/tripme-mark.svg'))

const left = html.match(/__[A-Z_]+__/g)

if (left) throw new Error(`unreplaced: ${[...new Set(left)].join(', ')}`)

const staged = join(mkdtempSync(join(tmpdir(), 'tripme-doc-')), 'doc.html')

writeFileSync(staged, html)

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--print-to-pdf=docs/TripMe-Лиды-и-Заказы.pdf',
  `file://${staged}`,
], { stdio: 'ignore' })

console.log('docs/TripMe-Лиды-и-Заказы.pdf')
