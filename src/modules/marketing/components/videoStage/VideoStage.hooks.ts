import { AD_SIZES } from '~/modules/marketing/contracts/marketing'
import type { AdMood } from '~/modules/marketing/contracts/marketing'
import { DURATION, motionFrame } from '~/modules/marketing/helpers/video/motion'
import type { IMotionSpec } from '~/modules/marketing/helpers/video/motion'
import { music } from '~/modules/marketing/helpers/video/music'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const POSTER = 6.4

export interface IVideoStageProps {
  spec: IMotionSpec | null
  mood: AdMood
}

const seconds = (value: number): string => `0:${String(Math.floor(value)).padStart(2, '0')}`

export const useVideoStage = (props: IVideoStageProps) => {
  const canvas = ref<HTMLCanvasElement | null>(null)
  const playing = ref(false)
  const muted = ref(false)
  const started = ref(false)
  const time = ref(POSTER)

  let context: AudioContext | null = null
  let gain: GainNode | null = null
  let source: AudioBufferSourceNode | null = null
  let audioClock = false
  let origin = 0
  let frame = 0
  let token = 0

  const now = () => audioClock && context ? context.currentTime : performance.now() / 1000

  function draw() {
    const element = canvas.value
    const spec = props.spec

    if (!element || !spec) return

    const { width, height } = AD_SIZES[spec.format]

    if (element.width !== width || element.height !== height) {
      element.width = width
      element.height = height
    }

    const ctx = element.getContext('2d', { alpha: false })

    if (ctx) motionFrame(ctx, spec, time.value)
  }

  function silence() {
    const current = source

    source = null

    if (!current) return

    current.stop()
    current.disconnect()
  }

  function tick() {
    if (!playing.value) return

    const elapsed = now() - origin

    if (elapsed >= DURATION) {
      time.value = 0
      void begin(0)
      return
    }

    time.value = elapsed
    draw()
    frame = requestAnimationFrame(tick)
  }

  async function begin(at: number) {
    const current = ++token
    const buffer = await music(props.mood).catch(() => null)

    if (current !== token || !playing.value) return

    silence()
    cancelAnimationFrame(frame)

    if (buffer && context && gain) {
      source = context.createBufferSource()
      source.buffer = buffer
      source.connect(gain)
      source.start(0, Math.min(at, buffer.duration - 0.01))
      audioClock = true
    }
    else {
      audioClock = false
    }

    origin = now() - at
    frame = requestAnimationFrame(tick)
  }

  function play() {
    if (!props.spec) return

    if (!context && typeof AudioContext !== 'undefined') {
      context = new AudioContext()
      gain = context.createGain()
      gain.gain.value = muted.value ? 0 : 1
      gain.connect(context.destination)
    }

    void context?.resume()

    if (!started.value || time.value >= DURATION - 0.05) time.value = 0

    started.value = true
    playing.value = true
    void begin(time.value)
  }

  function pause() {
    playing.value = false
    token++
    silence()
    cancelAnimationFrame(frame)
  }

  const toggle = () => (playing.value ? pause() : play())

  function seek(value: number) {
    time.value = Math.max(0, Math.min(DURATION, value))
    started.value = true
    draw()

    if (playing.value) void begin(time.value)
  }

  function toggleMute() {
    muted.value = !muted.value

    if (gain) gain.gain.value = muted.value ? 0 : 1
  }

  const clock = computed(() => `${seconds(time.value)} / ${seconds(DURATION)}`)

  const progress = computed(() => `${time.value / DURATION * 100}%`)

  watch(() => props.spec, () => {
    if (!playing.value) requestAnimationFrame(draw)
  })

  watch(() => props.mood, (mood) => {
    void music(mood).catch(() => null)

    if (playing.value) void begin(time.value)
  })

  onMounted(() => {
    requestAnimationFrame(draw)
    void music(props.mood).catch(() => null)
  })

  onBeforeUnmount(() => {
    pause()
    void context?.close().catch(() => undefined)
    context = null
  })

  return { canvas, playing, muted, time, clock, progress, duration: DURATION, toggle, play, pause, seek, toggleMute }
}
