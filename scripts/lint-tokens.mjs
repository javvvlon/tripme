#!/usr/bin/env node
/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'src')
const SCALE_FILE = join(SRC, 'shared/styles/utils/_typography.scss')

const EXTENSIONS = new Set(['.scss', '.vue'])

const RAW_FONT_SIZE = /font-size:\s*(?![^;]*(?:size\(|var\(--tm-size|inherit))[^;]*?[\d.]+(?:px|rem|em)/i

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

const failures = []

for (const file of walk(SRC)) {
  if (file === SCALE_FILE) continue
  if (![...EXTENSIONS].some(ext => file.endsWith(ext))) continue

  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (RAW_FONT_SIZE.test(line)) {
      failures.push(`${relative(ROOT, file)}:${i + 1}\n    ${line.trim()}`)
    }
  })
}

if (failures.length) {
  console.error(`\n✖ ${failures.length} font-size(s) bypass the type scale:\n`)
  failures.forEach(f => console.error(`  ${f}\n`))
  console.error('  Use size(<step>) — see $size in src/shared/styles/utils/_typography.scss\n')
  process.exit(1)
}

console.log('✔ every font-size comes from the type scale')
