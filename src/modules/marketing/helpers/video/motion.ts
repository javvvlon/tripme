import { AD_SIZES, DEFAULT_TEMPLATE } from '../../contracts/marketing'
import type { AdFormat, IAdTemplate } from '../../contracts/marketing'
import { groupedAmount } from '../ad'
import type { IAdLine, IAdText } from '../ad'
import { backdrop, BODY, BRAND, clip, fitLines, font, logo, pill, rrect, rule, shade, stars, track } from '../banner/draw'
import type { Ctx } from '../banner/draw'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const DURATION = 15

export const FPS = 30

export const BEATS = { open: 0.2, prices: 8, finale: 12.6 } as const

export interface IMotionSpec {
  format: AdFormat
  text: IAdText
  image: HTMLImageElement | null
  template: IAdTemplate | null
}

interface IMotionLayout {
  pad: number
  logo: number
  headline: number
  row: number
  sub: number
  rows: number
}

const LAYOUT: Record<AdFormat, IMotionLayout> = {
  story: { pad: 84, logo: 64, headline: 176, row: 108, sub: 38, rows: 5 },
  post: { pad: 72, logo: 54, headline: 140, row: 92, sub: 32, rows: 4 },
  square: { pad: 64, logo: 48, headline: 120, row: 80, sub: 30, rows: 3 },
}

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x))

const span = (t: number, start: number, length: number): number => clamp01((t - start) / length)

const outCubic = (x: number): number => 1 - (1 - x) ** 3

const inOutCubic = (x: number): number => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

const outBack = (x: number): number => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2

function withAlpha(ctx: Ctx, alpha: number, draw: () => void): void {
  if (alpha <= 0.001) return

  ctx.save()
  ctx.globalAlpha *= Math.min(1, alpha)
  draw()
  ctx.restore()
}

function priceRow(ctx: Ctx, text: IAdText, line: IAdLine, top: number, height: number, left: number, right: number, shown: number, cards: boolean): void {
  if (cards) {
    rrect(ctx, left, top, right - left, height * 0.9, height * 0.18)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.88)'
    ctx.fill()
    left += height * 0.26
    right -= height * 0.26
    height *= 0.9
  }
  else {
    rule(ctx, left, top, right - left)
  }

  const amount = groupedAmount(shown, line.unit)

  ctx.font = font(800, height * 0.36)

  const amountWidth = ctx.measureText(groupedAmount(line.value, line.unit)).width

  ctx.fillStyle = BRAND.ink
  ctx.textAlign = 'right'
  ctx.fillText(amount, right, top + height * 0.5)
  ctx.font = font(600, height * 0.21, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(text.priceNote, right, top + height * 0.8)
  ctx.textAlign = 'left'

  const nameWidth = right - left - amountWidth - 28

  ctx.font = font(700, height * 0.31)
  ctx.fillStyle = BRAND.ink
  ctx.fillText(clip(ctx, line.hotel, nameWidth), left, top + height * 0.46)

  const starsWidth = text.design.stars ? stars(ctx, line.stars, left, top + height * 0.61, height * 0.16) : 0
  const meta = [text.design.meal ? line.meal : '', line.date, line.nights].filter(Boolean).join(' · ')

  ctx.font = font(600, height * 0.21, BODY)
  ctx.fillStyle = BRAND.mute
  ctx.fillText(clip(ctx, meta, nameWidth - starsWidth - 14), left + starsWidth + (starsWidth ? 14 : 0), top + height * 0.79)
}

export function motionFrame(ctx: Ctx, spec: IMotionSpec, t: number): void {
  const { width, height } = AD_SIZES[spec.format]
  const layout = LAYOUT[spec.format]
  const { text } = spec
  const template = { ...DEFAULT_TEMPLATE, ...spec.template }
  const center = template.align === 'center'
  const pad = layout.pad
  const x = center ? width / 2 : pad
  const align: CanvasTextAlign = center ? 'center' : 'left'
  const photo = text.design.backdrop === 'photo' && Boolean(spec.image)

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.fillStyle = BRAND.bg
  ctx.fillRect(0, 0, width, height)

  const zoom = 1.04 + 0.08 * (t / DURATION)

  ctx.save()
  ctx.translate(width / 2, height * 0.4)
  ctx.scale(zoom, zoom)
  ctx.translate(-width / 2, -height * 0.4)
  backdrop(ctx, width, height, photo ? spec.image : null, text.design.focus / 100, {
    kind: text.design.backdrop === 'photo' ? 'scene' : text.design.backdrop,
    scene: text.scene,
    word: text.place,
  })
  ctx.restore()

  const k = (photo ? 0.45 : 0.3) + text.design.dim / 100 * (photo ? 1.1 : 0.7)

  shade(ctx, width, height, [[0, Math.min(1, 0.5 * k)], [0.25, 0.05], [0.45, Math.min(1, 0.25 * k)], [0.68, Math.min(1, 0.85 * k)], [1, Math.min(1, 0.97 * k + 0.1)]])

  const calm = inOutCubic(span(t, BEATS.prices, 0.8))

  if (calm > 0) {
    ctx.fillStyle = `rgba(10, 10, 10, ${0.35 * calm})`
    ctx.fillRect(0, 0, width, height)
  }

  const logoIn = outCubic(span(t, BEATS.open, 0.6))
  const logoWidth = layout.logo * 3.38

  withAlpha(ctx, logoIn, () => logo(ctx, center ? (width - logoWidth) / 2 : pad, pad - (1 - logoIn) * 24, layout.logo))

  if (text.hotBadge) {
    const pop = outBack(span(t, 0.7, 0.5))
    const pillHeight = Math.round(layout.logo * 0.82)
    const label = text.hotBadge.toLocaleUpperCase(text.language)

    ctx.font = font(800, pillHeight * 0.4)
    track(ctx, pillHeight * 0.06)

    const w = ctx.measureText(label).width + pillHeight * 1.1

    track(ctx, 0)

    if (pop > 0) {
      const cx = width - pad - w / 2
      const cy = pad + layout.logo / 2

      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(pop, pop)
      ctx.translate(-cx, -cy)
      pill(ctx, label, width - pad - w, pad + (layout.logo - pillHeight) / 2, pillHeight, { fill: BRAND.gold, ink: BRAND.bg, size: pillHeight * 0.4 })
      ctx.restore()
    }
  }

  const accentIn = inOutCubic(span(t, 0.3, 1.4))
  const inset = pad * 0.42

  if (template.accent === 'frame' && accentIn > 0) {
    const perimeter = 2 * (width + height - inset * 4)

    ctx.save()
    ctx.strokeStyle = 'rgba(197, 168, 128, 0.75)'
    ctx.lineWidth = 3
    ctx.setLineDash([perimeter * accentIn, perimeter])
    rrect(ctx, inset, inset, width - inset * 2, height - inset * 2, 26)
    ctx.stroke()
    ctx.restore()
  }

  if (template.accent === 'corner' && accentIn > 0) {
    const arm = width * 0.07 * accentIn

    ctx.save()
    ctx.strokeStyle = 'rgba(197, 168, 128, 0.75)'
    ctx.lineWidth = 3

    for (const [cx, cy, dx, dy] of [[inset, inset, 1, 1], [width - inset, inset, -1, 1], [inset, height - inset, 1, -1], [width - inset, height - inset, -1, -1]] as const) {
      ctx.beginPath()
      ctx.moveTo(cx, cy + dy * arm)
      ctx.lineTo(cx, cy)
      ctx.lineTo(cx + dx * arm, cy)
      ctx.stroke()
    }

    ctx.restore()
  }

  const inner = width - pad * 2
  const headline = template.case === 'title' ? text.copy.headline : text.copy.headline.toLocaleUpperCase(text.language)
  const head = fitLines(ctx, headline, inner, layout.headline, layout.headline * 0.4, 900)
  const rows = text.lines.slice(0, Math.max(1, Math.min(layout.rows, text.design.rows)))
  const rowGap = layout.row * (template.list === 'cards' ? 1.08 : 1)
  const listHeight = rows.length * rowGap
  const sub = [text.departureHero || text.dates, text.nights, text.design.meal ? text.meal : ''].filter(Boolean).join(' · ')
  const reserve = layout.row * 0.84 + layout.sub * 2.4
  const listTop = height - pad - reserve - listHeight
  const subTop = listTop - layout.sub * 2.2
  const headBottom = subTop - layout.sub * 0.6
  const headTop = headBottom - head.size * 0.95 * head.lines.length
  const kickerTop = headTop - layout.sub * 2.2

  const exit = inOutCubic(span(t, BEATS.prices, 0.7))
  const lift = -exit * 50

  withAlpha(ctx, 1 - exit, () => {
    ctx.save()
    ctx.translate(0, lift)

    const kickerIn = outCubic(span(t, 1.0, 0.45))
    const kickerLabel = text.copy.kicker.toLocaleUpperCase(text.language)

    if (kickerLabel && template.kicker !== 'none') {
      withAlpha(ctx, kickerIn, () => {
        const pillHeight = Math.round(layout.sub * 1.45)
        const size = pillHeight * 0.38

        ctx.font = font(800, size)
        track(ctx, size * 0.04)

        const w = ctx.measureText(kickerLabel).width + pillHeight * 0.96

        track(ctx, 0)

        const left = (center ? x - w / 2 : x) + (1 - kickerIn) * (center ? 0 : -30)

        if (template.kicker === 'text') {
          ctx.font = font(800, layout.sub * 0.62)
          track(ctx, layout.sub * 0.11)
          ctx.fillStyle = BRAND.gold
          ctx.textAlign = align
          ctx.fillText(kickerLabel, x, kickerTop + pillHeight * 0.7)
          ctx.textAlign = 'left'
          track(ctx, 0)
        }
        else {
          pill(ctx, kickerLabel, left, kickerTop, pillHeight, { stroke: BRAND.gold, ink: BRAND.gold, size })
        }
      })
    }

    head.lines.forEach((line, index) => {
      const reveal = outCubic(span(t, 1.25 + index * 0.16, 0.75))

      if (reveal <= 0) return

      const baseline = headTop + head.size * 0.84 + index * head.size * 0.95

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, baseline - head.size * 0.92, width, head.size * 1.1)
      ctx.clip()
      ctx.font = font(900, head.size)
      ctx.fillStyle = BRAND.ink
      ctx.textAlign = align
      ctx.fillText(line, x, baseline + (1 - reveal) * head.size * 0.95)
      ctx.restore()
    })

    withAlpha(ctx, outCubic(span(t, 2.0, 0.5)), () => {
      ctx.font = font(600, layout.sub, BODY)
      ctx.fillStyle = BRAND.mute
      ctx.textAlign = align
      ctx.fillText(clip(ctx, sub, inner), x, subTop + layout.sub)
      ctx.textAlign = 'left'
    })

    rows.forEach((line, index) => {
      const start = 2.7 + index * 0.4
      const enter = outCubic(span(t, start, 0.55))

      if (enter <= 0) return

      const counted = line.value * (0.6 + 0.4 * outCubic(span(t, start + 0.1, 0.9)))

      withAlpha(ctx, enter, () => {
        ctx.save()
        ctx.translate((1 - enter) * 70, 0)
        priceRow(ctx, text, line, listTop + index * rowGap, layout.row, pad, width - pad, Math.round(counted), template.list === 'cards')
        ctx.restore()
      })
    })

    const best = rows[0]

    if (best) {
      const sweep = inOutCubic(span(t, 2.7 + rows.length * 0.4 + 0.3, 0.7))

      if (sweep > 0) {
        ctx.fillStyle = BRAND.gold
        ctx.fillRect(pad, listTop + layout.row - 3, (width - pad * 2) * sweep, 3)
      }
    }

    ctx.restore()
  })

  const cheapest = text.lines[0]
  const heroIn = outCubic(span(t, BEATS.prices + 0.6, 0.6))
  const heroOut = inOutCubic(span(t, BEATS.finale - 0.3, 0.5))

  if (cheapest && heroIn > 0) {
    withAlpha(ctx, heroIn * (1 - heroOut), () => {
      const mid = height * 0.56 - heroOut * 40
      const counted = cheapest.value * outCubic(span(t, BEATS.prices + 0.7, 1.3))
      const size = layout.headline * 0.95
      const scale = 0.9 + 0.1 * outBack(span(t, BEATS.prices + 0.6, 0.6))

      ctx.textAlign = align
      ctx.font = font(800, layout.sub * 0.72)
      track(ctx, layout.sub * 0.12)
      ctx.fillStyle = BRAND.gold
      ctx.fillText(text.priceNote.toLocaleUpperCase(text.language), x, mid - size * 0.95)
      track(ctx, 0)

      ctx.save()
      ctx.translate(x, mid)
      ctx.scale(scale, scale)
      ctx.translate(-x, -mid)
      ctx.font = font(900, size)
      ctx.fillStyle = BRAND.ink
      ctx.fillText(groupedAmount(Math.round(counted), cheapest.unit), x, mid)
      ctx.restore()

      withAlpha(ctx, outCubic(span(t, BEATS.prices + 1.6, 0.6)), () => {
        ctx.font = font(700, layout.sub * 1.05)
        ctx.fillStyle = BRAND.ink
        ctx.fillText(clip(ctx, cheapest.hotel, inner), x, mid + layout.sub * 2.2)
        ctx.font = font(600, layout.sub * 0.85, BODY)
        ctx.fillStyle = BRAND.mute
        ctx.fillText(clip(ctx, [text.departureHero || text.dates, text.nights, text.design.party ? text.party : ''].filter(Boolean).join(' · '), inner), x, mid + layout.sub * 3.6)
      })

      ctx.textAlign = 'left'
    })
  }

  const finale = span(t, BEATS.finale, 2.4)

  if (finale > 0) {
    const titleIn = outCubic(span(t, BEATS.finale, 0.6))
    const ctaIn = outBack(span(t, BEATS.finale + 0.5, 0.6))
    const midY = height * 0.5

    withAlpha(ctx, titleIn, () => {
      const size = layout.headline * 0.72
      const fitted = fitLines(ctx, headline, inner, size, size * 0.5, 900)

      ctx.font = font(900, fitted.size)
      ctx.fillStyle = BRAND.ink
      ctx.textAlign = align
      fitted.lines.forEach((line, index) => ctx.fillText(line, x, midY - (fitted.lines.length - 1 - index) * fitted.size + (1 - titleIn) * 30))

      if (text.copy.kicker && template.kicker !== 'none') {
        ctx.font = font(800, layout.sub * 0.72)
        track(ctx, layout.sub * 0.12)
        ctx.fillStyle = BRAND.gold
        ctx.fillText(text.copy.kicker.toLocaleUpperCase(text.language), x, midY - fitted.lines.length * fitted.size - layout.sub * 0.2)
        track(ctx, 0)
      }

      ctx.textAlign = 'left'
    })

    const button = text.design.cta && template.cta !== 'none'
    const ctaHeight = Math.round(layout.row * 0.9)
    const ctaTop = midY + layout.sub * 2.2

    if (ctaIn > 0) {
      const label = text.copy.cta || text.site

      ctx.save()

      if (button) {
        const size = ctaHeight * 0.34

        ctx.font = font(800, size)
        track(ctx, size * 0.04)

        const w = ctx.measureText(label).width + ctaHeight * 0.96 + ctaHeight * 0.6

        track(ctx, 0)

        const left = center ? x - w / 2 : x
        const cx = left + w / 2
        const cy = ctaTop + ctaHeight / 2

        ctx.translate(cx, cy)
        ctx.scale(ctaIn, ctaIn)
        ctx.translate(-cx, -cy)
        pill(ctx, label, left, ctaTop, ctaHeight, { fill: BRAND.orange, ink: BRAND.bg, size, arrow: true })
      }

      ctx.restore()

      withAlpha(ctx, clamp01(ctaIn), () => {
        ctx.font = font(800, layout.sub * 1.05)
        ctx.fillStyle = BRAND.ink
        ctx.textAlign = align
        ctx.fillText(text.site, x, (button ? ctaTop + ctaHeight + layout.sub * 1.7 : ctaTop + layout.sub))
        ctx.font = font(600, layout.sub * 0.62, BODY)
        ctx.fillStyle = BRAND.mute
        ctx.fillText(clip(ctx, [text.pricesAt, text.design.party ? text.party : ''].filter(Boolean).join(' · '), inner), x, height - pad)
        ctx.textAlign = 'left'
      })
    }
  }

  const fadeIn = 1 - span(t, 0, 0.5)

  if (fadeIn > 0) {
    ctx.fillStyle = `rgba(10, 10, 10, ${fadeIn})`
    ctx.fillRect(0, 0, width, height)
  }
}
