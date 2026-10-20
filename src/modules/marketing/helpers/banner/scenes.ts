import { BRAND, font, track } from './draw'
import type { Ctx } from './draw'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SCENES = ['skyline', 'mosque', 'coast', 'pyramids', 'pagoda', 'tropic', 'atoll', 'mountains'] as const

export type SceneKind = typeof SCENES[number]

const RULES: Array<[RegExp, SceneKind]> = [
  [/istanbul|стамбул|sultanahmet|султанахмет|aksaray|аксарай|taksim|таксим|beyo[gğ]lu|fatih|фатих|sisli|шишли|laleli|лалели/i, 'mosque'],
  [/dubai|дуба[йи]|\buae\b|оаэ|emirat|эмират|sharjah|шардж|abu ?dhabi|абу.?даби|ajman|аджман|ras al|рас.?аль|fujairah|фуджейр|\bbaa\b|dubay/i, 'skyline'],
  [/egypt|егип|sharm|шарм|hurghad|хургад|makadi|макади|marsa|марса|dahab|дахаб|cairo|каир|misr/i, 'pyramids'],
  [/maldiv|мальдив/i, 'atoll'],
  [/thai|таиланд|тайланд|phuket|пхукет|pattaya|паттай|krabi|краби|samui|самуи|vietnam|вьетнам|nha ?trang|нячанг|phu ?quoc|фукуок|danang|дананг|china|китай|xitoy|tailand|vyetnam/i, 'pagoda'],
  [/sri ?lanka|шри.?ланк|bali|бали|indonesia|индонез|hainan|хайнань|goa\b|гоа|india|инди|zanzibar|занзибар|seychel|сейшел|mauriti|маврики|cuba|куба|dominican|доминикан|malaysia|малайз|langkawi/i, 'tropic'],
  [/georgia|грузи|batumi|батуми|tbilisi|тбилиси|gudauri|гудаури|armenia|армени|kyrgyz|кыргыз|киргиз|issyk|иссык|kazakh|казах|almaty|алмат|swiss|швейцар|austria|австри|gruziya/i, 'mountains'],
  [/turkey|турци|turkiya|antaly|анталь|kemer|кемер|belek|белек|\bside\b|сиде|alany|алань|bodrum|бодрум|marmaris|мармарис|fethiye|фетхие|cyprus|кипр|greece|греци|montenegro|черногор|spain|испани|italy|итали|tunis|тунис/i, 'coast'],
]

export function sceneOf(texts: string[]): SceneKind {
  const haystack = texts.filter(Boolean).join(' ')

  return RULES.find(([pattern]) => pattern.test(haystack))?.[1] ?? 'coast'
}

const gold = (alpha: number): string => `rgba(197, 168, 128, ${alpha})`

const warm = (alpha: number): string => `rgba(236, 212, 170, ${alpha})`

function seeded(seed: number): () => number {
  let state = seed

  return () => {
    state = (state * 16807) % 2147483647

    return state / 2147483647
  }
}

function sky(ctx: Ctx, width: number, height: number, horizon: number, glowX: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  gradient.addColorStop(0, '#0B0A09')
  gradient.addColorStop(horizon / height, '#1A1510')
  gradient.addColorStop(Math.min(1, horizon / height + 0.02), '#0C0B0A')
  gradient.addColorStop(1, BRAND.bg)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(glowX, horizon, 0, glowX, horizon, width * 0.75)

  glow.addColorStop(0, gold(0.32))
  glow.addColorStop(0.4, gold(0.08))
  glow.addColorStop(1, gold(0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

function water(ctx: Ctx, width: number, horizon: number, from: number, span: number): void {
  for (let i = 0; i < 16; i++) {
    const y = horizon + 10 + i * i * 2.2
    const length = span * (0.25 + i * 0.05)

    ctx.strokeStyle = warm(Math.max(0, 0.32 - i * 0.018))
    ctx.lineWidth = 2 + i * 0.2
    ctx.beginPath()
    ctx.moveTo(from - length / 2, y)
    ctx.lineTo(from + length / 2, y)
    ctx.stroke()
  }

  ctx.strokeStyle = gold(0.5)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, horizon)
  ctx.lineTo(width, horizon)
  ctx.stroke()
}

function outline(ctx: Ctx, draw: () => void, fill = '#100E0C', stroke = gold(0.85), lineWidth = 3): void {
  ctx.beginPath()
  draw()
  ctx.fillStyle = fill
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.stroke()
}

function skyline(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.62)

  const random = seeded(11)
  const s = width / 1080
  const towers: Array<[number, number, number]> = [
    [0.02, 0.11, 0.2], [0.12, 0.08, 0.3], [0.2, 0.07, 0.24], [0.27, 0.09, 0.36], [0.36, 0.06, 0.28],
    [0.42, 0.08, 0.42], [0.74, 0.07, 0.4], [0.81, 0.09, 0.3], [0.9, 0.06, 0.34], [0.96, 0.08, 0.22],
  ]

  for (const [x, w, h] of towers) {
    const left = width * x
    const top = horizon - height * h * 0.62
    const tw = width * w

    outline(ctx, () => {
      ctx.moveTo(left, horizon)
      ctx.lineTo(left, top + tw * 0.25)
      ctx.lineTo(left + tw * 0.5, top)
      ctx.lineTo(left + tw, top + tw * 0.25)
      ctx.lineTo(left + tw, horizon)
    }, '#0F0D0B', gold(0.45), 2)

    ctx.fillStyle = warm(0.5)

    for (let wy = top + tw * 0.5; wy < horizon - 10; wy += 22 * s) {
      for (let wx = left + 8 * s; wx < left + tw - 8 * s; wx += 16 * s) {
        if (random() > 0.72) ctx.fillRect(wx, wy, 4 * s, 7 * s)
      }
    }
  }

  const cx = width * 0.6
  const tiers = [[120, 0.12], [96, 0.1], [74, 0.1], [56, 0.09], [40, 0.09], [26, 0.08], [14, 0.08]] as const
  let base = horizon

  outline(ctx, () => {
    ctx.moveTo(cx - tiers[0][0] * s / 2, horizon)

    for (const [w, h] of tiers) {
      const top = base - height * h * 0.62

      ctx.lineTo(cx - w * s / 2, top)
      base = top
    }

    ctx.lineTo(cx, base - height * 0.1)

    base = horizon

    const right: Array<[number, number]> = []

    for (const [w, h] of tiers) {
      const top = base - height * h * 0.62

      right.push([cx + w * s / 2, top])
      base = top
    }

    for (const [x, y] of right.reverse()) ctx.lineTo(x, y)

    ctx.lineTo(cx + tiers[0][0] * s / 2, horizon)
  }, '#12100D', gold(0.95), 3)

  water(ctx, width, horizon, width * 0.6, width * 1.2)
}

function mosque(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.5)

  const s = width / 1080
  const cx = width * 0.5
  const body = horizon - 110 * s

  outline(ctx, () => {
    ctx.moveTo(cx - 300 * s, horizon)
    ctx.lineTo(cx - 300 * s, body)
    ctx.lineTo(cx + 300 * s, body)
    ctx.lineTo(cx + 300 * s, horizon)
  })

  for (const [dx, r] of [[-190, 80], [190, 80], [0, 170]] as const) {
    outline(ctx, () => {
      ctx.moveTo(cx + (dx - r) * s, body)
      ctx.arc(cx + dx * s, body, r * s, Math.PI, 0)
    })
  }

  outline(ctx, () => {
    ctx.moveTo(cx - 6 * s, body - 170 * s)
    ctx.lineTo(cx, body - 230 * s)
    ctx.lineTo(cx + 6 * s, body - 170 * s)
  }, gold(0.9), gold(0.9), 2)

  for (const dx of [-370, -330, 330, 370]) {
    const x = cx + dx * s
    const top = horizon - (dx === -330 || dx === 330 ? 470 : 400) * s

    outline(ctx, () => {
      ctx.moveTo(x - 11 * s, horizon)
      ctx.lineTo(x - 11 * s, top)
      ctx.lineTo(x, top - 70 * s)
      ctx.lineTo(x + 11 * s, top)
      ctx.lineTo(x + 11 * s, horizon)
    }, '#100E0C', gold(0.85), 2.5)

    for (const ring of [0.35, 0.6]) {
      ctx.strokeStyle = gold(0.8)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x - 17 * s, horizon - (horizon - top) * ring)
      ctx.lineTo(x + 17 * s, horizon - (horizon - top) * ring)
      ctx.stroke()
    }
  }

  ctx.strokeStyle = gold(0.6)
  ctx.lineWidth = 2

  for (const [x, y, w] of [[0.22, 0.2, 26], [0.27, 0.17, 18], [0.78, 0.24, 22]] as const) {
    ctx.beginPath()
    ctx.moveTo(width * x - w * s, horizon * y * 1.6)
    ctx.quadraticCurveTo(width * x - w * s * 0.4, horizon * y * 1.6 - 10 * s, width * x, horizon * y * 1.6)
    ctx.quadraticCurveTo(width * x + w * s * 0.4, horizon * y * 1.6 - 10 * s, width * x + w * s, horizon * y * 1.6)
    ctx.stroke()
  }

  water(ctx, width, horizon, cx, width)
}

function palm(ctx: Ctx, x: number, base: number, size: number, lean: number): void {
  const topX = x + lean * size
  const topY = base - size

  ctx.strokeStyle = gold(0.85)
  ctx.lineWidth = Math.max(3, size * 0.03)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, base)
  ctx.quadraticCurveTo(x + lean * size * 0.2, base - size * 0.6, topX, topY)
  ctx.stroke()

  ctx.lineWidth = Math.max(2, size * 0.02)

  for (let i = 0; i < 7; i++) {
    const angle = -Math.PI * 0.95 + i * (Math.PI * 0.9 / 6)
    const reach = size * (0.42 + (i % 2) * 0.08)
    const ex = topX + Math.cos(angle) * reach
    const ey = topY + Math.sin(angle) * reach * 0.55 + reach * 0.25

    ctx.beginPath()
    ctx.moveTo(topX, topY)
    ctx.quadraticCurveTo(topX + Math.cos(angle) * reach * 0.6, topY + Math.sin(angle) * reach * 0.6 - reach * 0.1, ex, ey)
    ctx.stroke()
  }
}

function coast(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.7)

  const ridges = [[0.55, 0.32], [0.38, 0.5], [0.24, 0.7]] as const

  ridges.forEach(([peak, alpha], layer) => {
    outline(ctx, () => {
      ctx.moveTo(-20, horizon)

      for (let x = 0; x <= width + 40; x += width / 9) {
        const wave = Math.sin(x / width * Math.PI * (2.2 + layer) + layer * 1.3)
        ctx.lineTo(x, horizon - height * peak * 0.35 * (0.55 + 0.45 * Math.abs(wave)) * (layer === 0 ? 1 : 0.8))
      }

      ctx.lineTo(width + 20, horizon)
    }, `rgba(16, 14, 12, ${0.6 + layer * 0.15})`, gold(alpha), 2)
  })

  ctx.fillStyle = warm(0.85)
  ctx.beginPath()
  ctx.arc(width * 0.72, horizon - height * 0.12, width * 0.055, 0, Math.PI * 2)
  ctx.fill()

  water(ctx, width, horizon, width * 0.72, width)
  palm(ctx, width * 0.9, horizon + 4, width * 0.34, -0.35)
}

function pyramids(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.3)

  ctx.fillStyle = warm(0.85)
  ctx.beginPath()
  ctx.arc(width * 0.22, horizon - height * 0.2, width * 0.06, 0, Math.PI * 2)
  ctx.fill()

  for (const [x, size] of [[0.68, 0.46], [0.36, 0.3], [0.9, 0.22]] as const) {
    const cx = width * x
    const half = width * size * 0.5
    const top = horizon - half * 0.95

    outline(ctx, () => {
      ctx.moveTo(cx - half, horizon)
      ctx.lineTo(cx, top)
      ctx.lineTo(cx + half, horizon)
    })

    ctx.beginPath()
    ctx.moveTo(cx, top)
    ctx.lineTo(cx + half * 0.25, horizon)
    ctx.lineTo(cx + half, horizon)
    ctx.closePath()
    ctx.fillStyle = gold(0.16)
    ctx.fill()
  }

  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = gold(0.3 - i * 0.05)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, horizon + 30 + i * 34)

    for (let x = 0; x <= width; x += 30) ctx.lineTo(x, horizon + 30 + i * 34 + Math.sin(x / 140 + i) * 10)

    ctx.stroke()
  }
}

function pagoda(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.5)

  const s = width / 1080
  const cx = width * 0.5
  let base = horizon
  const tiers = [[260, 70], [210, 64], [168, 58], [130, 52], [96, 46], [66, 40]] as const

  for (const [w, h] of tiers) {
    const top = base - h * s

    outline(ctx, () => {
      ctx.moveTo(cx - w * s / 2 - 22 * s, top + 10 * s)
      ctx.quadraticCurveTo(cx - w * s / 2, top + 4 * s, cx - w * s / 2 + 14 * s, top)
      ctx.lineTo(cx + w * s / 2 - 14 * s, top)
      ctx.quadraticCurveTo(cx + w * s / 2, top + 4 * s, cx + w * s / 2 + 22 * s, top + 10 * s)
      ctx.lineTo(cx + w * s / 2 - 6 * s, base)
      ctx.lineTo(cx - w * s / 2 + 6 * s, base)
      ctx.closePath()
    })

    base = top
  }

  outline(ctx, () => {
    ctx.moveTo(cx - 8 * s, base)
    ctx.lineTo(cx, base - 120 * s)
    ctx.lineTo(cx + 8 * s, base)
  }, gold(0.9), gold(0.9), 2)

  palm(ctx, width * 0.12, horizon + 4, width * 0.3, 0.3)
  palm(ctx, width * 0.88, horizon + 4, width * 0.26, -0.3)
  water(ctx, width, horizon, cx, width)
}

function tropic(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.5)

  ctx.fillStyle = warm(0.9)
  ctx.beginPath()
  ctx.arc(width * 0.5, horizon, width * 0.12, Math.PI, 0)
  ctx.fill()

  water(ctx, width, horizon, width * 0.5, width * 1.1)
  palm(ctx, width * 0.14, horizon + 30, width * 0.5, 0.28)
  palm(ctx, width * 0.26, horizon + 30, width * 0.34, 0.12)
  palm(ctx, width * 0.86, horizon + 30, width * 0.44, -0.3)
}

function atoll(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.65)

  const s = width / 1080
  const pier = horizon + 40 * s

  ctx.strokeStyle = gold(0.75)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(width * 0.05, pier)
  ctx.lineTo(width * 0.95, pier)
  ctx.stroke()

  for (let i = 0; i < 6; i++) {
    const x = width * (0.12 + i * 0.15)
    const roof = pier - 70 * s

    outline(ctx, () => {
      ctx.moveTo(x - 46 * s, roof + 18 * s)
      ctx.lineTo(x, roof - 18 * s)
      ctx.lineTo(x + 46 * s, roof + 18 * s)
      ctx.lineTo(x + 34 * s, roof + 18 * s)
      ctx.lineTo(x + 34 * s, pier)
      ctx.lineTo(x - 34 * s, pier)
      ctx.lineTo(x - 34 * s, roof + 18 * s)
      ctx.closePath()
    }, '#100E0C', gold(0.85), 2.5)

    ctx.strokeStyle = gold(0.5)
    ctx.lineWidth = 2

    for (const dx of [-26, 26]) {
      ctx.beginPath()
      ctx.moveTo(x + dx * s, pier)
      ctx.lineTo(x + dx * s, pier + 40 * s)
      ctx.stroke()
    }
  }

  water(ctx, width, horizon, width * 0.65, width)
  palm(ctx, width * 0.84, horizon - 6, width * 0.3, -0.25)
}

function mountains(ctx: Ctx, width: number, height: number, horizon: number): void {
  sky(ctx, width, height, horizon, width * 0.4)

  const peaks = [[0.18, 0.3], [0.45, 0.42], [0.72, 0.34], [0.95, 0.26]] as const

  outline(ctx, () => {
    ctx.moveTo(-20, horizon)

    for (const [x, h] of peaks) {
      ctx.lineTo(width * x - width * 0.12, horizon - height * h * 0.35)
      ctx.lineTo(width * x, horizon - height * h)
      ctx.lineTo(width * x + width * 0.12, horizon - height * h * 0.4)
    }

    ctx.lineTo(width + 20, horizon)
  }, '#100E0C', gold(0.85), 3)

  for (const [x, h] of peaks) {
    ctx.beginPath()
    ctx.moveTo(width * x, horizon - height * h)
    ctx.lineTo(width * x - width * 0.045, horizon - height * h * 0.78)
    ctx.lineTo(width * x - width * 0.01, horizon - height * h * 0.82)
    ctx.lineTo(width * x + width * 0.02, horizon - height * h * 0.74)
    ctx.lineTo(width * x + width * 0.05, horizon - height * h * 0.8)
    ctx.closePath()
    ctx.fillStyle = warm(0.75)
    ctx.fill()
  }

  ctx.strokeStyle = gold(0.4)
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, horizon)
  ctx.lineTo(width, horizon)
  ctx.stroke()
}

const DRAW: Record<SceneKind, (ctx: Ctx, width: number, height: number, horizon: number) => void> = {
  skyline, mosque, coast, pyramids, pagoda, tropic, atoll, mountains,
}

export const horizonOf = (height: number): number => height * Math.min(0.46, 0.18 + 360 / height)

export function scene(ctx: Ctx, width: number, height: number, kind: SceneKind): void {
  ctx.save()
  DRAW[kind](ctx, width, height, horizonOf(height))
  ctx.restore()
}

export function lettering(ctx: Ctx, width: number, height: number, word: string): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height)

  gradient.addColorStop(0, '#13110E')
  gradient.addColorStop(1, BRAND.bg)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const text = word.toLocaleUpperCase() || 'TRIPME'
  const lines = text.length > 9 ? [text.slice(0, Math.ceil(text.length / 2)), text.slice(Math.ceil(text.length / 2))] : [text, text]

  ctx.save()
  ctx.translate(width / 2, height * 0.3)
  ctx.rotate(-0.08)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  lines.forEach((line, index) => {
    let size = height * 0.24

    ctx.font = font(900, size)

    while (ctx.measureText(line).width > width * 1.25 && size > 60) {
      size -= 8
      ctx.font = font(900, size)
    }

    track(ctx, size * 0.02)
    ctx.strokeStyle = gold(index === 0 ? 0.55 : 0.22)
    ctx.lineWidth = Math.max(2, size * 0.012)
    ctx.strokeText(line, index === 0 ? 0 : width * 0.12, (index - 0.5) * size * 0.95)
  })

  track(ctx, 0)
  ctx.restore()
}
