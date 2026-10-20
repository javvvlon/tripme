import { AudioBufferSource, BufferTarget, CanvasSource, canEncodeVideo, getFirstEncodableAudioCodec, Mp4OutputFormat, Output, QUALITY_HIGH } from 'mediabunny'
import { AD_SIZES } from '../../contracts/marketing'
import type { AdFormat, AdMood } from '../../contracts/marketing'
import { DURATION, FPS, motionFrame } from './motion'
import type { IMotionSpec } from './motion'
import { music, SAMPLE_RATE } from './music'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export class VideoUnsupportedError extends Error {}

export interface IVideoFile {
  blob: Blob
  width: number
  height: number
  duration: number
}

const YIELD_EVERY = 6

function pause(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }

    channel.port2.postMessage(null)
  })
}

export async function canRenderVideo(format: AdFormat): Promise<boolean> {
  if (typeof VideoEncoder === 'undefined') return false

  const { width, height } = AD_SIZES[format]

  return canEncodeVideo('avc', { width, height, frameRate: FPS, quality: QUALITY_HIGH }).catch(() => false)
}

export async function renderVideo(spec: IMotionSpec, mood: AdMood, onProgress: (share: number) => void, signal?: AbortSignal): Promise<IVideoFile> {
  if (!await canRenderVideo(spec.format)) throw new VideoUnsupportedError('avc')

  const { width, height } = AD_SIZES[spec.format]
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false })

  if (!ctx) throw new VideoUnsupportedError('canvas')

  const audioCodec = typeof AudioEncoder === 'undefined'
    ? null
    : await getFirstEncodableAudioCodec(['aac', 'opus'], { numberOfChannels: 2, sampleRate: SAMPLE_RATE, quality: QUALITY_HIGH }).catch(() => null)

  const target = new BufferTarget()
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target })
  const video = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_HIGH, keyFrameInterval: 2 })
  const audio = audioCodec ? new AudioBufferSource({ codec: audioCodec, quality: QUALITY_HIGH }) : null

  output.addVideoTrack(video, { frameRate: FPS })

  if (audio) output.addAudioTrack(audio)

  try {
    await output.start()

    const sound = audio ? audio.add(await music(mood)) : Promise.resolve()
    const frames = Math.round(DURATION * FPS)

    for (let index = 0; index < frames; index++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

      const time = index / FPS

      motionFrame(ctx, spec, time)
      await video.add(time, 1 / FPS)
      onProgress((index + 1) / frames * 0.96)

      if (index % YIELD_EVERY === 0) await pause()
    }

    await sound
    await output.finalize()
  }
  catch (error) {
    await output.cancel().catch(() => undefined)
    throw error
  }

  if (!target.buffer) throw new VideoUnsupportedError('empty')

  onProgress(1)

  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), width, height, duration: DURATION }
}
