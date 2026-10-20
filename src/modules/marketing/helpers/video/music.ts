import type { AdMood } from '../../contracts/marketing'
import { BEATS, DURATION } from './motion'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const SAMPLE_RATE = 48000

const PEAK = 0.89

interface IMoodPlan {
  bpm: number
  kick: number
  hats: number
  claps: number
  bass: number
  pad: number
  pluck: number
  roots: number[]
  chords: number[][]
}

const PLANS: Record<AdMood, IMoodPlan> = {
  warm: {
    bpm: 108, kick: 0.85, hats: 0.05, claps: 0, bass: 0.22, pad: 0.06, pluck: 0.05,
    roots: [73.42, 61.74, 82.41, 65.41],
    chords: [[293.66, 369.99, 440], [246.94, 311.13, 369.99], [329.63, 415.3, 493.88], [261.63, 329.63, 392]],
  },
  drive: {
    bpm: 124, kick: 1, hats: 0.08, claps: 0.18, bass: 0.3, pad: 0.035, pluck: 0.06,
    roots: [87.31, 69.3, 77.78, 65.41],
    chords: [[349.23, 415.3, 523.25], [277.18, 349.23, 415.3], [311.13, 392, 466.16], [261.63, 311.13, 392]],
  },
  calm: {
    bpm: 84, kick: 0, hats: 0.025, claps: 0, bass: 0.12, pad: 0.085, pluck: 0.045,
    roots: [65.41, 55, 73.42, 61.74],
    chords: [[261.63, 329.63, 392, 493.88], [220, 277.18, 329.63, 415.3], [293.66, 369.99, 440, 554.37], [246.94, 311.13, 369.99, 466.16]],
  },
}

const cache = new Map<AdMood, Promise<AudioBuffer>>()

export function music(mood: AdMood): Promise<AudioBuffer> {
  const known = cache.get(mood)

  if (known) return known

  const rendered = renderMusic(mood)

  cache.set(mood, rendered)
  rendered.catch(() => cache.delete(mood))

  return rendered
}

async function renderMusic(mood: AdMood): Promise<AudioBuffer> {
  const plan = PLANS[mood]
  const length = Math.round(SAMPLE_RATE * DURATION)
  const ac = new OfflineAudioContext(2, length, SAMPLE_RATE)
  const master = ac.createGain()
  const comp = ac.createDynamicsCompressor()

  master.gain.setValueAtTime(0.8, 0)
  master.gain.setValueAtTime(0.8, DURATION - 1.2)
  master.gain.linearRampToValueAtTime(0, DURATION)
  comp.threshold.value = -16
  comp.ratio.value = 3
  comp.attack.value = 0.004
  comp.release.value = 0.18
  master.connect(comp)
  comp.connect(ac.destination)

  const noiseBuffer = ac.createBuffer(1, SAMPLE_RATE * 2, SAMPLE_RATE)
  const noiseData = noiseBuffer.getChannelData(0)
  let seed = 11

  for (let i = 0; i < noiseData.length; i++) {
    seed = (seed * 16807) % 2147483647
    noiseData[i] = seed / 1073741823.5 - 1
  }

  const envelope = (t: number, attack: number, peak: number, decay: number): GainNode => {
    const gain = ac.createGain()

    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.linearRampToValueAtTime(peak, t + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)

    return gain
  }

  const route = (node: AudioNode, pan = 0): void => {
    const panner = ac.createStereoPanner()

    panner.pan.value = pan
    node.connect(panner)
    panner.connect(master)
  }

  const filter = (type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode => {
    const node = ac.createBiquadFilter()

    node.type = type
    node.frequency.value = frequency
    node.Q.value = q

    return node
  }

  const noise = (t: number, duration: number): AudioBufferSourceNode => {
    const source = ac.createBufferSource()

    source.buffer = noiseBuffer
    source.loop = true
    source.start(t, (t * 0.37) % 1.5)
    source.stop(t + duration)

    return source
  }

  const kick = (t: number, level: number): void => {
    const osc = ac.createOscillator()
    const env = envelope(t, 0.002, level, 0.38)

    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12)
    osc.connect(env)
    route(env)
    osc.start(t)
    osc.stop(t + 0.45)
  }

  const hat = (t: number, level: number, pan: number): void => {
    const hp = filter('highpass', 8000)
    const env = envelope(t, 0.001, level, 0.04)

    noise(t, 0.06).connect(hp)
    hp.connect(env)
    route(env, pan)
  }

  const clap = (t: number, level: number): void => {
    const bp = filter('bandpass', 1600, 0.8)
    const env = envelope(t, 0.002, level, 0.16)

    noise(t, 0.2).connect(bp)
    bp.connect(env)
    route(env)
  }

  const bass = (t: number, frequency: number, duration: number, level: number): void => {
    const saw = ac.createOscillator()
    const sub = ac.createOscillator()
    const lp = filter('lowpass', 500, 2.5)
    const env = envelope(t, 0.008, level, duration)
    const subEnv = envelope(t, 0.008, level * 0.8, duration)

    saw.type = 'sawtooth'
    saw.frequency.value = frequency
    sub.frequency.value = frequency / 2
    lp.frequency.setValueAtTime(800, t)
    lp.frequency.exponentialRampToValueAtTime(240, t + duration)
    saw.connect(lp)
    lp.connect(env)
    sub.connect(subEnv)
    route(env)
    route(subEnv)
    saw.start(t)
    saw.stop(t + duration + 0.05)
    sub.start(t)
    sub.stop(t + duration + 0.05)
  }

  const pad = (t: number, chord: number[], duration: number, level: number): void => {
    for (const [index, frequency] of chord.entries()) {
      const osc = ac.createOscillator()
      const lp = filter('lowpass', 1400, 0.5)
      const gain = ac.createGain()

      osc.type = 'triangle'
      osc.frequency.value = frequency
      osc.detune.value = (index % 2 ? 6 : -6)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(level, t + duration * 0.3)
      gain.gain.linearRampToValueAtTime(level * 0.7, t + duration * 0.8)
      gain.gain.linearRampToValueAtTime(0.0001, t + duration + 0.2)
      osc.connect(lp)
      lp.connect(gain)
      route(gain, index % 2 ? 0.25 : -0.25)
      osc.start(t)
      osc.stop(t + duration + 0.3)
    }
  }

  const pluck = (t: number, frequency: number, level: number, pan: number): void => {
    const osc = ac.createOscillator()
    const env = envelope(t, 0.002, level, 0.3)

    osc.type = 'triangle'
    osc.frequency.value = frequency
    osc.connect(env)
    route(env, pan)
    osc.start(t)
    osc.stop(t + 0.4)
  }

  const whoosh = (t: number, duration: number, from: number, to: number, level: number): void => {
    const bp = filter('bandpass', from, 1.2)
    const gain = ac.createGain()

    bp.frequency.setValueAtTime(from, t)
    bp.frequency.exponentialRampToValueAtTime(to, t + duration)
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(level, t + duration * 0.7)
    gain.gain.linearRampToValueAtTime(0, t + duration)
    noise(t, duration).connect(bp)
    bp.connect(gain)
    route(gain)
  }

  const chime = (t: number, level: number): void => {
    for (const [index, frequency] of [1046.5, 1318.5, 1568].entries()) pluck(t + index * 0.06, frequency, level, index - 1)
  }

  const beat = 60 / plan.bpm
  const bar = beat * 4
  const bars = Math.ceil(DURATION / bar)

  for (let b = 0; b < bars; b++) {
    const start = b * bar
    const chord = plan.chords[b % plan.chords.length]!
    const root = plan.roots[b % plan.roots.length]!

    if (plan.pad) pad(start, chord, bar, plan.pad)

    for (let step = 0; step < 4; step++) {
      const t = start + step * beat

      if (t >= DURATION - 0.6) continue

      if (plan.kick && t >= BEATS.open) kick(t, step === 0 ? plan.kick : plan.kick * 0.8)
      if (plan.hats) hat(t + beat / 2, plan.hats, step % 2 ? 0.25 : -0.25)
      if (plan.claps && (step === 1 || step === 3) && t >= BEATS.open + bar) clap(t, plan.claps)
      if (plan.bass && t >= BEATS.open + bar * 0.5) bass(t + (plan.kick ? beat / 2 : 0), root, beat * 0.45, plan.bass)
      if (plan.pluck && step % 2 === 0) pluck(t + beat * 0.25, chord[(b + step) % chord.length]! * 2, plan.pluck, step ? 0.3 : -0.3)
    }
  }

  whoosh(Math.max(0, BEATS.prices - 0.6), 0.7, 400, 4200, 0.2)
  whoosh(Math.max(0, BEATS.finale - 0.6), 0.7, 500, 5200, 0.22)
  chime(BEATS.prices + 0.6, 0.05)
  chime(BEATS.finale + 0.5, 0.06)

  return normalised(await ac.startRendering())
}

function normalised(buffer: AudioBuffer): AudioBuffer {
  let peak = 0

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    for (const sample of buffer.getChannelData(channel)) peak = Math.max(peak, Math.abs(sample))
  }

  if (peak < 0.001) return buffer

  const gain = PEAK / peak

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel)

    for (let i = 0; i < data.length; i++) data[i] = data[i]! * gain
  }

  return buffer
}
