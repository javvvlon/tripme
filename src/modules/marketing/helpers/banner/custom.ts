import { DEFAULT_TEMPLATE } from '../../contracts/marketing'
import type { IAdTemplate } from '../../contracts/marketing'
import type { IAdLine } from '../ad'
import { backdrop, BODY, BRAND, clip, fitLines, font, logo, pill, rrect, rule, shade, stars, track } from './draw'
import type { IFrame } from './render'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
interface IBlock {
  height: number
  gap: number
  draw: (top: number) => void
}

const SIZE: Record<IAdTemplate['headline'], number> = { s: 0.66, m: 0.82, l: 1, xl: 1.2 }

const AIR: Record<IAdTemplate['spacing'], number> = { tight: 0.8, normal: 1, airy: 1.3 }

const LIST_ROW: Record<IAdTemplate['list'], number> = { rows: 1, cards: 1.08, minimal: 0.56 }

function overlay(frame: IFrame, template: IAdTemplate, photo: boolean): void {
  const { ctx, width, height } = frame
  const k = 0.4 + template.dim / 100 * 1.2
  const scale = (stops: Array<[number, number]>) => stops.map(([at, alpha]) => [at, Math.min(1, alpha * (photo ? k : k * 0.6))] as [number, number])

  if (template.overlay === 'full') {
    shade(ctx, width, height, scale([[0, 0.55], [0.5, 0.6], [1, 0.9]]))
    return
  }

  if (template.overlay === 'top') {
    shade(ctx, width, height, scale([[0, 0.85], [0.45, 0.25], [0.7, 0.55], [1, 0.95]]))
    return
  }

  shade(ctx, width, height, scale([[0, 0.5], [0.22, 0.06], [0.42, 0.18], [0.62, 0.8], [1, 0.97]]))
}

function hot(frame: IFrame, top: number): void {
  const { ctx, width, layout, spec } = frame

  if (!spec.text.hotBadge) return

  const height = Math.round(layout.logo * 0.82)
  const label = spec.text.hotBadge.toLocaleUpperCase(spec.text.language)

  ctx.font = font(800, height * 0.4)
  track(ctx, height * 0.06)

  const pillWidth = ctx.measureText(label).width + height * 1.1

  track(ctx, 0)
  pill(ctx, label, width - layout.pad - pillWidth, top + (layout.logo - height) / 2, height, { fill: BRAND.gold, ink: BRAND.bg, size: height * 0.4 })
}

function pillWidth(ctx: CanvasRenderingContext2D, label: string, height: number, size: number, arrow = false): number {
  ctx.font = font(800, size)
  track(ctx, size * 0.04)

  const width = ctx.measureText(label).width + height * 0.96 + (arrow ? height * 0.6 : 0)

  track(ctx, 0)

  return width
}

function listRow(frame: IFrame, line: IAdLine, top: number, height: number, left: number, right: number, style: IAdTemplate['list'], center: boolean): void {
  const { ctx, spec } = frame
  const { design, priceNote } = spec.text

  if (style === 'minimal') {
    ctx.font = font(700, height * 0.5)
    ctx.fillStyle = BRAND.ink

    if (center) {
      const label = `${line.hotel} — ${line.amount}`

      ctx.textAlign = 'center'
      ctx.fillText(clip(ctx, label, right - left), (left + right) / 2, top + height * 0.68)
      ctx.textAlign = 'left'
      return
    }

    ctx.font = font(800, height * 0.52)

    const amountWidth = ctx.measureText(line.amount).width

    ctx.textAlign = 'right'
    ctx.fillText(line.amount, right, top + height * 0.68)
    ctx.textAlign = 'left'
    ctx.font = font(700, height * 0.5)
    ctx.fillText(clip(ctx, line.hotel, right - left - amountWidth - 24), left, top + height * 0.68)
    return
  }

  if (style === 'cards') {
    rrect(ctx, left, top, right - left, height * 0.9, height * 0.18)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.88)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(197, 168, 128, 0.22)'
    ctx.lineWidth = 2
    ctx.stroke()

    left += height * 0.26
    right -= height * 0.26
    height *= 0.9
  }
  else {
    rule(ctx, left, top, right - left)
  }

  ctx.font = font(800, height * 0.36)

  const amountWidth = ctx.measureText(line.amount).width

  ctx.fillStyle = BRAND.ink
  ctx.textAlign = 'right'
  ctx.fillText(line.amount, right, top + height * 0.5)
  ctx.font = font(600, height * 0.21, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(priceNote, right, top + height * 0.8)
  ctx.textAlign = 'left'

  const nameWidth = right - left - amountWidth - 28

  ctx.font = font(700, height * 0.31)
  ctx.fillStyle = BRAND.ink
  ctx.fillText(clip(ctx, line.hotel, nameWidth), left, top + height * 0.46)

  const starsWidth = design.stars ? stars(ctx, line.stars, left, top + height * 0.61, height * 0.16) : 0
  const meta = [design.meal ? line.meal : '', line.date, line.nights].filter(Boolean).join(' · ')

  ctx.font = font(600, height * 0.21, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(clip(ctx, meta, nameWidth - starsWidth - 14), left + starsWidth + (starsWidth ? 14 : 0), top + height * 0.79)
}

function accent(frame: IFrame, template: IAdTemplate): void {
  const { ctx, width, height, layout } = frame
  const inset = layout.pad * 0.42

  ctx.save()
  ctx.strokeStyle = 'rgba(197, 168, 128, 0.75)'
  ctx.lineWidth = 3

  if (template.accent === 'frame') {
    rrect(ctx, inset, inset, width - inset * 2, height - inset * 2, 26)
    ctx.stroke()
  }

  if (template.accent === 'corner') {
    const arm = width * 0.07

    for (const [x, y, dx, dy] of [[inset, inset, 1, 1], [width - inset, inset, -1, 1], [inset, height - inset, 1, -1], [width - inset, height - inset, -1, -1]] as const) {
      ctx.beginPath()
      ctx.moveTo(x, y + dy * arm)
      ctx.lineTo(x, y)
      ctx.lineTo(x + dx * arm, y)
      ctx.stroke()
    }
  }

  ctx.restore()
}

export function custom(frame: IFrame): void {
  const { ctx, width, height, layout, spec } = frame
  const { text } = spec
  const template = { ...DEFAULT_TEMPLATE, ...spec.template }
  const air = AIR[template.spacing]
  const pad = layout.pad * (0.9 + air * 0.1)
  const center = template.align === 'center'
  const split = template.layout === 'split'
  const card = template.layout === 'card'
  const photo = text.design.backdrop === 'photo' && Boolean(spec.image)
  const splitAt = height * (frame.spec.format === 'story' ? 0.5 : 0.44)

  backdrop(ctx, width, height, photo ? spec.image : null, text.design.focus / 100, {
    kind: text.design.backdrop === 'photo' ? 'scene' : text.design.backdrop,
    scene: text.scene,
    word: text.place,
  })

  if (split) {
    shade(ctx, width, splitAt, [[0, 0.35], [0.7, 0.05], [1, 0.25]])
    ctx.fillStyle = BRAND.bg
    ctx.fillRect(0, splitAt, width, height - splitAt)

    if (template.accent === 'line') {
      ctx.fillStyle = BRAND.gold
      ctx.fillRect(center ? width / 2 - 60 : pad, splitAt - 2, 120, 4)
    }
  }
  else {
    overlay(frame, template, photo)
  }

  const logoWidth = layout.logo * 3.38

  logo(ctx, center ? (width - logoWidth) / 2 : pad, layout.pad, layout.logo)
  hot(frame, layout.pad)

  const left = card ? pad + pad * 0.55 : pad
  const right = width - left
  const inner = right - left
  const x = center ? width / 2 : left
  const gap = layout.sub * 0.62 * air

  const kickerBlock = (): IBlock | null => {
    const label = text.copy.kicker.toLocaleUpperCase(text.language)

    if (template.kicker === 'none' || !label) return null

    if (template.kicker === 'text') {
      const size = layout.sub * 0.62

      return {
        height: size * 1.2,
        gap,
        draw: (top) => {
          ctx.font = font(800, size)
          track(ctx, size * 0.18)
          ctx.fillStyle = BRAND.gold
          ctx.textAlign = center ? 'center' : 'left'
          ctx.fillText(label, x, top + size)
          ctx.textAlign = 'left'
          track(ctx, 0)
        },
      }
    }

    const pillHeight = Math.round(layout.sub * 1.45)
    const size = pillHeight * 0.38

    return {
      height: pillHeight,
      gap,
      draw: (top) => {
        const w = pillWidth(ctx, label, pillHeight, size)

        pill(ctx, label, center ? x - w / 2 : x, top, pillHeight, { stroke: BRAND.gold, ink: BRAND.gold, size })
      },
    }
  }

  const headline = template.case === 'upper' ? text.copy.headline.toLocaleUpperCase(text.language) : text.copy.headline
  const headSize = layout.headline * SIZE[template.headline]
  const head = fitLines(ctx, headline, inner, headSize, headSize * 0.4, 900)
  const accentLine = template.accent === 'line' && !split

  const headlineBlock: IBlock = {
    height: head.size * 0.95 * head.lines.length + (accentLine ? 34 : 0),
    gap: gap * 0.7,
    draw: (top) => {
      let y = top

      if (accentLine) {
        ctx.fillStyle = BRAND.gold
        ctx.fillRect(center ? x - 60 : x, y, 120, 4)
        y += 34
      }

      ctx.font = font(900, head.size)
      ctx.fillStyle = BRAND.ink
      ctx.textAlign = center ? 'center' : 'left'
      head.lines.forEach((line, index) => ctx.fillText(line, x, y + head.size * 0.84 + index * head.size * 0.95))
      ctx.textAlign = 'left'
    },
  }

  const sub = [text.departureHero || text.dates, text.nights, text.design.meal ? text.meal : ''].filter(Boolean).join(' · ')
  const subBlock: IBlock = {
    height: layout.sub * 1.15,
    gap: gap * 1.4,
    draw: (top) => {
      ctx.font = font(600, layout.sub, BODY)
      ctx.fillStyle = BRAND.mute
      ctx.textAlign = center ? 'center' : 'left'
      ctx.fillText(clip(ctx, sub, inner), x, top + layout.sub * 0.9)
      ctx.textAlign = 'left'
    },
  }

  const first = text.lines[0]
  const heroBlock: IBlock | null = template.price === 'hero' && first
    ? {
        height: layout.sub * 0.8 + layout.headline * 0.66,
        gap: gap * 1.4,
        draw: (top) => {
          ctx.textAlign = center ? 'center' : 'left'
          ctx.font = font(700, layout.sub * 0.62)
          track(ctx, layout.sub * 0.1)
          ctx.fillStyle = BRAND.gold
          ctx.fillText(text.priceNote.toLocaleUpperCase(text.language), x, top + layout.sub * 0.6)
          track(ctx, 0)
          ctx.font = font(900, layout.headline * 0.62)
          ctx.fillStyle = BRAND.ink
          ctx.fillText(first.amount, x, top + layout.sub * 0.8 + layout.headline * 0.56)
          ctx.textAlign = 'left'
        },
      }
    : null

  const rowHeight = layout.row * LIST_ROW[template.list]
  const listBlock = (count: number): IBlock | null => {
    const lines = text.lines.slice(template.price === 'hero' ? 1 : 0).slice(0, count)

    if (!lines.length) return null

    return {
      height: lines.length * rowHeight,
      gap: gap * 1.6,
      draw: (top) => lines.forEach((line, index) =>
        listRow(frame, line, top + index * rowHeight, rowHeight, left, right, template.list, center)),
    }
  }

  const withButton = text.design.cta && template.cta !== 'none'
  const ctaHeight = withButton && template.cta === 'pill' ? Math.round(layout.row * 0.84) : Math.round(layout.sub * 1.4)
  const siteBlock: IBlock = {
    height: ctaHeight,
    gap: gap * 0.9,
    draw: (top) => {
      const size = layout.sub * 0.95

      ctx.font = font(800, size)
      ctx.fillStyle = BRAND.ink
      ctx.textAlign = center ? 'center' : 'left'
      ctx.fillText(text.site, x, top + size * 1.05)
      ctx.textAlign = 'left'
    },
  }
  const buttonBlock: IBlock = {
    height: center && template.cta === 'pill' ? ctaHeight + layout.sub * 1.5 : ctaHeight,
    gap: gap * 0.9,
    draw: (top) => {
      const label = text.copy.cta || text.site

      if (template.cta === 'text') {
        const size = layout.sub * 0.95

        ctx.font = font(800, size)
        ctx.fillStyle = BRAND.orange
        ctx.textAlign = center ? 'center' : 'left'
        ctx.fillText(center ? `${label} → ${text.site}` : `${label} →`, x, top + size * 1.05)

        if (!center) {
          ctx.fillStyle = BRAND.ink
          ctx.textAlign = 'right'
          ctx.fillText(text.site, right, top + size * 1.05)
        }

        ctx.textAlign = 'left'
        return
      }

      const size = ctaHeight * 0.34
      const w = pillWidth(ctx, label, ctaHeight, size, true)

      pill(ctx, label, center ? x - w / 2 : left, top, ctaHeight, { fill: BRAND.orange, ink: BRAND.bg, size, arrow: true })
      ctx.font = font(800, size)
      ctx.fillStyle = BRAND.ink
      ctx.textBaseline = 'middle'

      if (center) {
        ctx.textAlign = 'center'
        ctx.fillText(text.site, x, top + ctaHeight + layout.sub * 0.9)
      }
      else {
        ctx.textAlign = 'right'
        ctx.fillText(text.site, right, top + ctaHeight / 2 + 1)
      }

      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    },
  }

  const ctaBlock = withButton ? buttonBlock : siteBlock

  const footerText = [text.pricesAt, text.design.party ? text.party : ''].filter(Boolean).join(' · ')
  const footerBlock: IBlock = {
    height: layout.sub * 0.75,
    gap: 0,
    draw: (top) => {
      ctx.font = font(600, layout.sub * 0.62, BODY)
      ctx.fillStyle = BRAND.mute
      ctx.textAlign = center ? 'center' : 'left'
      ctx.fillText(clip(ctx, footerText, inner), x, top + layout.sub * 0.6)
      ctx.textAlign = 'left'
    },
  }

  const total = (blocks: Array<IBlock | null>): number =>
    blocks.reduce((sum, block, index, all) => sum + (block ? block.height + (index < all.length - 1 ? block.gap : 0) : 0), 0)

  const place = (blocks: Array<IBlock | null>, top: number): number => {
    let y = top

    for (const block of blocks) {
      if (!block) continue

      block.draw(y)
      y += block.height + block.gap
    }

    return y
  }

  const maxRows = Math.max(1, Math.min(layout.rows, text.design.rows, text.lines.length))
  const fit = (build: (rows: number) => Array<IBlock | null>, room: number): Array<IBlock | null> => {
    for (let rows = maxRows; rows >= 1; rows--) {
      const blocks = build(rows)

      if (total(blocks) <= room) return blocks
    }

    return build(1)
  }

  const contentTop = layout.pad + layout.logo + gap * 2
  const bottom = height - pad

  if (template.layout === 'poster') {
    const top = [kickerBlock(), headlineBlock, subBlock]
    const after = place(top, contentTop + gap)
    const rest = fit(rows => [heroBlock, listBlock(rows), ctaBlock, footerBlock], bottom - after - gap)

    place(rest, bottom - total(rest))
  }
  else if (split) {
    const blocks = fit(rows => [kickerBlock(), headlineBlock, subBlock, heroBlock, listBlock(rows), ctaBlock, footerBlock], bottom - splitAt - gap * 2)

    place(blocks, splitAt + gap * 1.6)
  }
  else if (card) {
    const cardPad = pad * 0.55
    const blocks = fit(rows => [kickerBlock(), headlineBlock, subBlock, heroBlock, listBlock(rows), ctaBlock, footerBlock], bottom - contentTop - cardPad * 2)
    const cardHeight = total(blocks) + cardPad * 2
    const cardTop = bottom - cardHeight

    rrect(ctx, pad, cardTop, width - pad * 2, cardHeight, 34)
    ctx.fillStyle = 'rgba(14, 14, 14, 0.9)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(197, 168, 128, 0.35)'
    ctx.lineWidth = 2
    ctx.stroke()
    place(blocks, cardTop + cardPad)
  }
  else {
    const blocks = fit(rows => [kickerBlock(), headlineBlock, subBlock, heroBlock, listBlock(rows), ctaBlock, footerBlock], bottom - contentTop)

    place(blocks, bottom - total(blocks))
  }

  accent(frame, template)
}
