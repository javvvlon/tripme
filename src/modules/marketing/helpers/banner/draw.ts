import { LOGO_BOX, LOGO_ME, LOGO_SUITCASE, LOGO_TRIP } from '~/shared/components/logo/Logo.config'
import { lettering, scene } from './scenes'
import type { SceneKind } from './scenes'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const BRAND = {
  bg: '#0A0A0A',
  card: '#141414',
  tile: '#1B1B1B',
  ink: '#F5F3F0',
  mute: 'rgba(245, 243, 240, 0.64)',
  faint: 'rgba(245, 243, 240, 0.14)',
  orange: '#FF6B00',
  gold: '#C5A880',
  goldDeep: '#8F7247',
  paper: '#F5F3F0',
  paperInk: '#0A0A0A',
  paperMute: 'rgba(10, 10, 10, 0.58)',
} as const

export const HEAD = 'Montserrat'

export const BODY = 'Nunito'

export type Ctx = CanvasRenderingContext2D

export const HEAD_MAX_WEIGHT = 700

export const font = (weight: number, size: number, family = HEAD): string =>
  `${family === HEAD ? Math.min(weight, HEAD_MAX_WEIGHT) : weight} ${Math.round(size)}px ${family}, system-ui, sans-serif`

export function track(ctx: Ctx, pixels: number): void {
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${pixels}px`
}

export function fit(ctx: Ctx, text: string, maxWidth: number, size: number, min: number, weight: number, family = HEAD): number {
  let current = size

  ctx.font = font(weight, current, family)

  while (current > min && ctx.measureText(text).width > maxWidth) {
    current -= 2
    ctx.font = font(weight, current, family)
  }

  return current
}

export function fitLines(ctx: Ctx, text: string, maxWidth: number, size: number, min: number, weight: number, maxLines = 2): { size: number, lines: string[] } {
  const single = fit(ctx, text, maxWidth, size, Math.max(min, size * 0.62), weight)

  if (ctx.measureText(text).width <= maxWidth || maxLines < 2 || !text.includes(' ')) {
    return { size: fit(ctx, text, maxWidth, single, min, weight), lines: [text] }
  }

  let current = size

  while (current >= min) {
    ctx.font = font(weight, current)

    const lines = wrap(ctx, text, maxWidth, maxLines)

    if (lines.join(' ') === text && lines.every(line => ctx.measureText(line).width <= maxWidth)) return { size: current, lines }

    current -= 2
  }

  ctx.font = font(weight, min)

  return { size: min, lines: wrap(ctx, text, maxWidth, maxLines) }
}

export function clip(ctx: Ctx, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text

  let cut = text

  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1)

  return `${cut.trimEnd()}…`
}

export function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word

    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
      continue
    }

    lines.push(line)
    line = word

    if (lines.length === maxLines) break
  }

  if (lines.length < maxLines && line) lines.push(line)

  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) lines[maxLines - 1] = clip(ctx, `${lines[maxLines - 1]}…`, maxWidth)

  return lines
}

export function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2)

  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function cover(ctx: Ctx, image: HTMLImageElement, x: number, y: number, w: number, h: number, focusY = 0.45): void {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight)
  const sw = w / scale
  const sh = h / scale
  const sx = (image.naturalWidth - sw) / 2
  const sy = Math.max(0, Math.min(image.naturalHeight - sh, (image.naturalHeight - sh) * focusY))

  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h)
}

export interface IBackdropContext {
  kind: 'scene' | 'type' | 'night'
  scene: SceneKind
  word: string
}

export function backdrop(ctx: Ctx, width: number, height: number, image: HTMLImageElement | null, focusY: number, context: IBackdropContext): void {
  ctx.fillStyle = BRAND.bg
  ctx.fillRect(0, 0, width, height)

  if (image) {
    cover(ctx, image, 0, 0, width, height, focusY)
    return
  }

  if (context.kind === 'scene') scene(ctx, width, height, context.scene)
  else if (context.kind === 'type') lettering(ctx, width, height, context.word)
  else night(ctx, width, height)
}

function night(ctx: Ctx, width: number, height: number): void {
  const glow = ctx.createRadialGradient(width * 0.82, height * 0.12, 0, width * 0.82, height * 0.12, width * 1.1)

  glow.addColorStop(0, 'rgba(197, 168, 128, 0.22)')
  glow.addColorStop(0.45, 'rgba(197, 168, 128, 0.05)')
  glow.addColorStop(1, 'rgba(197, 168, 128, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(245, 243, 240, 0.035)'
  ctx.lineWidth = 2

  for (let r = width * 0.3; r < width * 1.6; r += width * 0.16) {
    ctx.beginPath()
    ctx.arc(width * 0.82, height * 0.12, r, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function shade(ctx: Ctx, width: number, height: number, stops: Array<[number, number]>): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  for (const [at, alpha] of stops) gradient.addColorStop(at, `rgba(10, 10, 10, ${alpha})`)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function logo(ctx: Ctx, x: number, y: number, height: number, ink: string = BRAND.ink): number {
  const scale = height / 131.3

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = ink
  ctx.fill(new Path2D(LOGO_TRIP), 'evenodd')
  ctx.fillStyle = BRAND.orange
  ctx.fill(new Path2D(LOGO_ME), 'evenodd')

  for (const d of LOGO_SUITCASE) ctx.fill(new Path2D(d), 'evenodd')

  ctx.restore()

  return height * LOGO_BOX.full.ratio
}

export function mark(ctx: Ctx, x: number, y: number, height: number, color: string = BRAND.orange): void {
  const scale = height / 131.3

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = color

  for (const d of LOGO_SUITCASE) ctx.fill(new Path2D(d), 'evenodd')

  ctx.restore()
}

export function stars(ctx: Ctx, count: number, x: number, y: number, size: number, color: string = BRAND.gold): number {
  const gap = size * 0.28

  ctx.fillStyle = color

  for (let i = 0; i < count; i++) {
    const cx = x + size / 2 + i * (size + gap)
    const cy = y + size / 2

    ctx.beginPath()

    for (let p = 0; p < 10; p++) {
      const radius = p % 2 === 0 ? size / 2 : size / 4.6
      const angle = -Math.PI / 2 + (p * Math.PI) / 5

      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
    }

    ctx.closePath()
    ctx.fill()
  }

  return count ? count * size + (count - 1) * gap : 0
}

export function pill(ctx: Ctx, label: string, x: number, y: number, height: number, options: { fill?: string, stroke?: string, ink: string, size: number, weight?: number, arrow?: boolean }): number {
  ctx.font = font(options.weight ?? 800, options.size)
  track(ctx, options.size * 0.04)

  const arrow = options.arrow ? height * 0.42 : 0
  const pad = height * 0.48
  const width = ctx.measureText(label).width + pad * 2 + (arrow ? arrow + height * 0.18 : 0)

  rrect(ctx, x, y, width, height, height / 2)

  if (options.fill) {
    ctx.fillStyle = options.fill
    ctx.fill()
  }

  if (options.stroke) {
    ctx.strokeStyle = options.stroke
    ctx.lineWidth = Math.max(2, height * 0.04)
    ctx.stroke()
  }

  ctx.fillStyle = options.ink
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + pad, y + height / 2 + 1)
  track(ctx, 0)

  if (arrow) {
    const ax = x + width - pad - arrow
    const ay = y + height / 2

    ctx.strokeStyle = options.ink
    ctx.lineWidth = Math.max(3, height * 0.06)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(ax + arrow, ay)
    ctx.moveTo(ax + arrow * 0.58, ay - arrow * 0.42)
    ctx.lineTo(ax + arrow, ay)
    ctx.lineTo(ax + arrow * 0.58, ay + arrow * 0.42)
    ctx.stroke()
  }

  ctx.textBaseline = 'alphabetic'

  return width
}

export function rule(ctx: Ctx, x: number, y: number, width: number, color: string = BRAND.faint, dash: number[] = []): void {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.stroke()
  ctx.restore()
}

export function swatch(canvas: HTMLCanvasElement, context: IBackdropContext): void {
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  canvas.width = 240
  canvas.height = 300
  ctx.save()
  ctx.scale(240 / 1080, 300 / 1350)
  backdrop(ctx, 1080, 1350, null, 0.45, context)
  ctx.restore()
}
