import { AD_SIZES } from '../../contracts/marketing'
import type { AdFormat, AdStyle, IAdTemplate } from '../../contracts/marketing'
import { custom } from './custom'
import type { IAdLine, IAdText } from '../ad'
import { backdrop, BODY, BRAND, clip, fit, fitLines, font, logo, mark, pill, rrect, rule, shade, stars, track } from './draw'
import type { Ctx } from './draw'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IBannerLabels {
  departures: string
  date: string
  hotel: string
  nights: string
  price: string
  from: string
  perTour: string
}

export interface IBannerSpec {
  format: AdFormat
  style: AdStyle
  text: IAdText
  labels: IBannerLabels
  image: HTMLImageElement | null
  template?: IAdTemplate | null
}

export interface ILayout {
  pad: number
  logo: number
  headline: number
  rows: number
  row: number
  sub: number
  tile: number
  ticket: number
  extra: number
}

const LAYOUT: Record<AdFormat, ILayout> = {
  story: { pad: 84, logo: 60, headline: 170, rows: 5, row: 112, sub: 38, tile: 104, ticket: 600, extra: 3 },
  post: { pad: 72, logo: 50, headline: 136, rows: 4, row: 92, sub: 32, tile: 92, ticket: 440, extra: 2 },
  square: { pad: 64, logo: 46, headline: 116, rows: 3, row: 84, sub: 30, tile: 80, ticket: 400, extra: 0 },
}

export interface IFrame {
  ctx: Ctx
  width: number
  height: number
  layout: ILayout
  spec: IBannerSpec
}

const subOf = (text: IAdText): string =>
  [text.departureHero || text.dates, text.nights, text.design.meal ? text.meal : ''].filter(Boolean).join(' · ')

function hotPill(frame: IFrame): void {
  const { ctx, width, layout, spec } = frame

  if (!spec.text.hotBadge) return

  const height = Math.round(layout.logo * 0.82)

  ctx.font = font(800, height * 0.4)
  track(ctx, height * 0.06)

  const label = spec.text.hotBadge.toLocaleUpperCase(spec.text.language)
  const pillWidth = ctx.measureText(label).width + height * 1.1

  track(ctx, 0)
  pill(ctx, label, width - layout.pad - pillWidth, layout.pad + (layout.logo - height) / 2, height, {
    fill: BRAND.gold, ink: BRAND.bg, size: height * 0.4,
  })
}

const headlineOf = (text: IAdText): string => (text.design.caps ? text.copy.headline.toLocaleUpperCase(text.language) : text.copy.headline)

function paint(frame: IFrame, stops: Array<[number, number]>, plain: Array<[number, number]>): void {
  const { ctx, width, height, spec } = frame
  const { design } = spec.text
  const photo = design.backdrop === 'photo' ? spec.image : null
  const strength = 0.35 + (design.dim / 100) * 1.3

  backdrop(ctx, width, height, photo, design.focus / 100, {
    kind: design.backdrop === 'photo' ? 'scene' : design.backdrop,
    scene: spec.text.scene,
    word: spec.text.place,
  })
  shade(ctx, width, height, photo ? stops.map(([at, alpha]) => [at, Math.min(1, alpha * strength)]) : plain)
}

function footer(frame: IFrame): number {
  const { ctx, height, layout, spec } = frame
  const size = Math.round(layout.sub * 0.68)
  const y = height - layout.pad

  ctx.font = font(600, size, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.textAlign = 'left'
  ctx.fillText(clip(ctx, [spec.text.pricesAt, spec.text.design.party ? spec.text.party : ''].filter(Boolean).join(' · '), frame.width - layout.pad * 2), layout.pad, y)

  return y - size - 30
}

function callToAction(frame: IFrame, bottom: number): number {
  const { ctx, width, layout, spec } = frame
  const height = Math.round(layout.row * 0.84)
  const top = bottom - height

  if (spec.text.design.cta) {
    pill(ctx, spec.text.copy.cta || spec.text.site, layout.pad, top, height, {
      fill: BRAND.orange, ink: BRAND.bg, size: height * 0.34, arrow: true,
    })
  }

  ctx.font = font(800, height * 0.34)
  ctx.fillStyle = BRAND.ink
  ctx.textAlign = spec.text.design.cta ? 'right' : 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(spec.text.site, spec.text.design.cta ? width - layout.pad : layout.pad, top + height / 2 + 1)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  return top - 40
}

function kicker(frame: IFrame, label: string, bottom: number, color: string = BRAND.gold): number {
  if (!label) return bottom

  const height = Math.round(frame.layout.sub * 1.5)

  pill(frame.ctx, label.toUpperCase(), frame.layout.pad, bottom - height, height, {
    stroke: color, ink: color, size: height * 0.38,
  })

  return bottom - height - 26
}

function hotelRow(frame: IFrame, line: IAdLine, top: number, height: number, ink: string = BRAND.ink, mute: string = BRAND.mute): void {
  const { ctx, width, layout } = frame
  const right = width - layout.pad

  ctx.font = font(800, height * 0.36)
  const priceWidth = ctx.measureText(line.amount).width

  ctx.fillStyle = ink
  ctx.textAlign = 'right'
  ctx.fillText(line.amount, right, top + height * 0.5)

  ctx.font = font(600, height * 0.22, BODY)
  ctx.fillStyle = mute
  ctx.fillText(frame.spec.text.priceNote, right, top + height * 0.82)
  ctx.textAlign = 'left'

  const nameWidth = right - layout.pad - priceWidth - 32

  ctx.font = font(700, height * 0.32)
  ctx.fillStyle = ink
  ctx.fillText(clip(ctx, line.hotel, nameWidth), layout.pad, top + height * 0.46)

  const { design } = frame.spec.text
  const starSize = height * 0.17
  const starsWidth = design.stars ? stars(ctx, line.stars, layout.pad, top + height * 0.62, starSize) : 0
  const meta = [design.meal ? line.meal : '', line.date, line.nights].filter(Boolean).join(' · ')

  ctx.font = font(600, height * 0.22, BODY)
  ctx.fillStyle = mute
  ctx.fillText(clip(ctx, meta, nameWidth - starsWidth - 16), layout.pad + starsWidth + (starsWidth ? 16 : 0), top + height * 0.8)
}

function classic(frame: IFrame): void {
  const { ctx, width, height, layout, spec } = frame
  const { text } = spec

  paint(frame, [[0, 0.62], [0.2, 0.08], [0.36, 0.12], [0.58, 0.82], [1, 0.97]], [[0, 0], [0.5, 0.1], [1, 0.55]])
  logo(ctx, layout.pad, layout.pad, layout.logo)
  hotPill(frame)

  const headline = headlineOf(text)
  const head = fitLines(ctx, headline, width - layout.pad * 2, layout.headline, layout.headline * 0.42, 900)
  const headHeight = head.size * 0.92 * head.lines.length + (head.lines.length - 1) * head.size * 0.08
  const kickerHeight = text.copy.kicker ? layout.sub * 1.5 + 26 : 0
  const fixed = layout.sub * 0.68 + 30 + layout.row * 0.84 + 40 + 36 + layout.sub + 22 + headHeight + 26 + kickerHeight
  const room = height - layout.pad * 2 - layout.logo - 60 - fixed
  const rows = Math.max(1, Math.min(layout.rows, text.design.rows, text.lines.length, Math.floor(room / layout.row)))

  let y = callToAction(frame, footer(frame))
  const top = y - rows * layout.row

  text.lines.slice(0, rows).forEach((line, index) => {
    const rowTop = top + index * layout.row

    rule(ctx, layout.pad, rowTop, width - layout.pad * 2)
    hotelRow(frame, line, rowTop, layout.row)
  })

  y = top - 36

  ctx.font = font(600, layout.sub, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(clip(ctx, subOf(text), width - layout.pad * 2), layout.pad, y)
  y -= layout.sub + 22

  ctx.font = font(900, head.size)
  ctx.fillStyle = BRAND.ink

  head.lines.slice().reverse().forEach((line, index) => {
    ctx.fillText(line, layout.pad, y - index * head.size)
  })

  y -= headHeight + 26

  kicker(frame, text.copy.kicker, y)
}

function tiles(frame: IFrame, word: string, top: number): number {
  const { ctx, width, layout } = frame
  const available = width - layout.pad * 2
  const gap = Math.round(layout.tile * 0.1)
  const words = word.toUpperCase().split(/\s+/).filter(Boolean)
  const lines: string[] = []

  for (const part of words) {
    const last = lines[lines.length - 1]

    if (last && (last.length + 1 + part.length) <= 10) lines[lines.length - 1] = `${last} ${part}`
    else lines.push(part)
  }

  const shown = lines.slice(0, 3)
  const longest = Math.max(1, ...shown.map(line => line.length))
  const tileWidth = Math.min(layout.tile * (shown.length > 2 ? 0.8 : 1), (available - gap * (longest - 1)) / longest)
  const tileHeight = tileWidth * 1.34
  let y = top

  for (const line of shown) {
    [...line].forEach((char, index) => {
      const x = layout.pad + index * (tileWidth + gap)

      if (char === ' ') return

      rrect(ctx, x, y, tileWidth, tileHeight, tileWidth * 0.12)
      ctx.fillStyle = BRAND.tile
      ctx.fill()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.fillRect(x, y, tileWidth, tileHeight / 2)
      ctx.fillStyle = BRAND.bg
      ctx.fillRect(x, y + tileHeight / 2 - 1.5, tileWidth, 3)

      ctx.font = font(800, tileHeight * 0.6)
      ctx.fillStyle = BRAND.ink
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(char, x + tileWidth / 2, y + tileHeight / 2 + tileHeight * 0.04)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    })

    y += tileHeight + gap
  }

  return y
}

function board(frame: IFrame): void {
  const { ctx, width, height, layout, spec } = frame
  const { text, labels } = spec

  paint(frame, [[0, 0.78], [0.5, 0.86], [1, 0.95]], [[0, 0.35], [1, 0.75]])
  logo(ctx, layout.pad, layout.pad, layout.logo)

  if (text.hotBadge) hotPill(frame)
  else {
    ctx.font = font(800, layout.sub * 0.62)
    track(ctx, layout.sub * 0.14)
    ctx.fillStyle = BRAND.gold
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(labels.departures.toUpperCase(), width - layout.pad, layout.pad + layout.logo / 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    track(ctx, 0)
  }

  let y = tiles(frame, text.copy.headline, layout.pad + layout.logo + layout.tile * 0.7)

  y += layout.sub * 0.9

  if (text.copy.kicker) {
    ctx.font = font(800, layout.sub * 0.78)
    track(ctx, layout.sub * 0.1)
    ctx.fillStyle = BRAND.gold
    ctx.fillText(text.copy.kicker.toUpperCase(), layout.pad, y)
    track(ctx, 0)
    y += layout.sub * 1.3
  }

  ctx.font = font(600, layout.sub, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(clip(ctx, subOf(text), width - layout.pad * 2), layout.pad, y)
  y += layout.sub * 1.6

  const bottom = callToAction(frame, footer(frame))
  const rowHeight = Math.round(layout.row * 0.74)
  const gap = Math.round(rowHeight * 0.14)
  const head = layout.sub * 0.9
  const rows = Math.max(1, Math.min(layout.rows + 1, text.design.rows, text.lines.length, Math.floor((bottom - y - head) / (rowHeight + gap))))
  const inner = width - layout.pad * 2
  const columns = { date: layout.pad + 28, hotel: layout.pad + inner * 0.2, nights: layout.pad + inner * 0.69, price: width - layout.pad - 28 }

  ctx.font = font(800, layout.sub * 0.52)
  track(ctx, layout.sub * 0.08)
  ctx.fillStyle = BRAND.gold
  ctx.fillText(labels.date.toUpperCase(), columns.date, y)
  ctx.fillText(labels.hotel.toUpperCase(), columns.hotel, y)
  ctx.fillText(labels.nights.toUpperCase(), columns.nights, y)
  ctx.textAlign = 'right'
  ctx.fillText(labels.price.toUpperCase(), columns.price, y)
  ctx.textAlign = 'left'
  track(ctx, 0)
  y += head * 0.6

  text.lines.slice(0, rows).forEach((line) => {
    rrect(ctx, layout.pad, y, inner, rowHeight, rowHeight * 0.16)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.92)'
    ctx.fill()

    const base = y + rowHeight * 0.62

    ctx.font = font(700, rowHeight * 0.32)
    ctx.fillStyle = BRAND.ink
    ctx.fillText(line.date.toUpperCase(), columns.date, base)
    ctx.fillText(clip(ctx, line.hotel.toUpperCase(), columns.nights - columns.hotel - 24), columns.hotel, base)
    ctx.fillStyle = BRAND.mute
    ctx.fillText(line.nights.replace(/\D+/g, '') || line.nights, columns.nights, base)
    ctx.font = font(800, rowHeight * 0.34)
    ctx.fillStyle = BRAND.ink
    ctx.textAlign = 'right'
    ctx.fillText(line.amount, columns.price, base)
    ctx.textAlign = 'left'

    y += rowHeight + gap
  })
}

function ticket(frame: IFrame): void {
  const { ctx, width, height, layout, spec } = frame
  const { text } = spec

  paint(frame, [[0, 0.5], [0.16, 0.05], [0.4, 0.2], [0.62, 0.92], [1, 1]], [[0, 0], [0.55, 0.2], [1, 0.7]])
  logo(ctx, layout.pad, layout.pad, layout.logo)
  hotPill(frame)

  let bottom = callToAction(frame, footer(frame))
  const extras = text.lines.slice(1, Math.min(1 + layout.extra, text.design.rows))
  const extraRow = Math.round(layout.row * 0.62)

  if (extras.length) {
    bottom -= extras.length * extraRow

    extras.forEach((line, index) => {
      const top = bottom + index * extraRow

      ctx.font = font(700, extraRow * 0.4)
      ctx.fillStyle = BRAND.ink
      ctx.fillText(clip(ctx, line.hotel, width - layout.pad * 2 - 260), layout.pad, top + extraRow * 0.62)

      ctx.font = font(800, extraRow * 0.42)
      ctx.textAlign = 'right'
      ctx.fillText(line.amount, width - layout.pad, top + extraRow * 0.62)
      ctx.textAlign = 'left'
      rule(ctx, layout.pad, top + extraRow, width - layout.pad * 2)
    })

    bottom -= 34
  }

  const cardHeight = layout.ticket
  const cardTop = bottom - cardHeight
  const cardLeft = layout.pad
  const cardWidth = width - layout.pad * 2
  const split = cardLeft + cardWidth * 0.66
  const notch = cardHeight * 0.05

  const holes = new Path2D()

  holes.rect(0, 0, width, height)

  for (const edge of [cardTop, cardTop + cardHeight]) {
    holes.moveTo(split + notch, edge)
    holes.arc(split, edge, notch, 0, Math.PI * 2)
  }

  ctx.save()
  ctx.clip(holes, 'evenodd')
  rrect(ctx, cardLeft, cardTop, cardWidth, cardHeight, 36)
  ctx.fillStyle = BRAND.paper
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(10, 10, 10, 0.28)'
  ctx.lineWidth = 3
  ctx.setLineDash([12, 12])
  ctx.beginPath()
  ctx.moveTo(split, cardTop + notch + 14)
  ctx.lineTo(split, cardTop + cardHeight - notch - 14)
  ctx.stroke()
  ctx.restore()

  const inner = 52
  const mainWidth = split - cardLeft - inner * 2
  let y = cardTop + inner + layout.sub * 0.6

  if (text.copy.kicker) {
    ctx.font = font(800, layout.sub * 0.62)
    track(ctx, layout.sub * 0.1)
    ctx.fillStyle = BRAND.goldDeep
    ctx.fillText(clip(ctx, text.copy.kicker.toUpperCase(), mainWidth), cardLeft + inner, y)
    track(ctx, 0)
  }

  const headline = headlineOf(text)
  const single = fitLines(ctx, headline, mainWidth, cardHeight * 0.26, cardHeight * 0.1, 900)
  const head = single.lines.length > 1 ? fitLines(ctx, headline, mainWidth, cardHeight * 0.16, cardHeight * 0.09, 900) : single

  ctx.font = font(900, head.size)
  ctx.fillStyle = BRAND.paperInk

  for (const line of head.lines) {
    y += head.size * 1.02
    ctx.fillText(line, cardLeft + inner, y)
  }

  const facts = [
    [text.departureHero || text.dates, text.nights].filter(Boolean).join(' · '),
    [text.design.meal ? text.meal : '', text.design.party ? text.party : ''].filter(Boolean).join(' · '),
  ].filter(Boolean)

  ctx.font = font(700, layout.sub * 0.9, BODY)
  ctx.fillStyle = BRAND.paperMute

  facts.forEach((fact, index) => {
    ctx.fillText(clip(ctx, fact, mainWidth), cardLeft + inner, cardTop + cardHeight - inner - (facts.length - 1 - index) * layout.sub * 1.3)
  })

  const stubLeft = split + inner * 0.7
  const stubWidth = cardLeft + cardWidth - inner * 0.7 - stubLeft
  const first = text.lines[0]

  ctx.font = font(700, layout.sub * 0.72, BODY)
  ctx.fillStyle = BRAND.paperMute
  ctx.fillText(text.priceNote, stubLeft, cardTop + inner + layout.sub * 0.6)

  if (first) {
    const priceSize = fit(ctx, first.amount, stubWidth, cardHeight * 0.17, cardHeight * 0.07, 900)

    ctx.fillStyle = BRAND.paperInk
    ctx.fillText(first.amount, stubLeft, cardTop + inner + layout.sub * 0.6 + priceSize * 1.15)

    ctx.font = font(700, layout.sub * 0.62, BODY)
    ctx.fillStyle = BRAND.paperMute
    ctx.fillText(clip(ctx, first.hotel, stubWidth), stubLeft, cardTop + inner + layout.sub * 0.6 + priceSize * 1.15 + layout.sub)
    if (text.design.stars) stars(ctx, first.stars, stubLeft, cardTop + inner + layout.sub * 0.6 + priceSize * 1.15 + layout.sub * 1.5, layout.sub * 0.5, BRAND.goldDeep)
  }

  const markHeight = cardHeight * 0.22

  mark(ctx, cardLeft + cardWidth - inner * 0.7 - markHeight * 0.515, cardTop + cardHeight - inner * 0.7 - markHeight, markHeight)
}

const STYLES: Record<AdStyle, (frame: IFrame) => void> = { classic, board, ticket, custom }

export function renderBanner(canvas: HTMLCanvasElement, spec: IBannerSpec): void {
  const { width, height } = AD_SIZES[spec.format]

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  STYLES[spec.style]({ ctx, width, height, layout: LAYOUT[spec.format], spec })
}

export async function fontsReady(sample: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return

  await Promise.all([
    document.fonts.load(font(900, 64), sample),
    document.fonts.load(font(800, 64), sample),
    document.fonts.load(font(700, 64), sample),
    document.fonts.load(font(600, 64, BODY), sample),
    document.fonts.load(font(700, 64, BODY), sample),
  ]).catch(() => undefined)
}

export function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()

    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

export function renderTo(spec: IBannerSpec): HTMLCanvasElement {
  const canvas = document.createElement('canvas')

  renderBanner(canvas, spec)

  return canvas
}

export function toBlob(spec: IBannerSpec): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      renderTo(spec).toBlob(resolve, 'image/png')
    }
    catch {
      resolve(null)
    }
  })
}

export function toDataUrl(spec: IBannerSpec, width = 540): string | null {
  const full = renderTo(spec)
  const small = document.createElement('canvas')

  small.width = width
  small.height = Math.round(full.height * (width / full.width))
  small.getContext('2d')?.drawImage(full, 0, 0, small.width, small.height)

  try {
    return small.toDataURL('image/jpeg', 0.86)
  }
  catch {
    return null
  }
}

export async function download(spec: IBannerSpec, filename: string): Promise<boolean> {
  const blob = await toBlob(spec)

  if (!blob) return false

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)

  return true
}
