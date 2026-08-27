import { Model } from '~/shared/helpers/model'
import { Destination } from '~/search_engine/models/Destination'
import { Tour } from '~/search_engine/models/Tour'
import { User } from '~/modules/auth/models/User'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
const MODELS = {
  Destination,
  Tour,
  User,
} as const

type ModelName = keyof typeof MODELS

interface SerialisedModel {
  model: ModelName
  properties: unknown
}

export default definePayloadPlugin(() => {
  definePayloadReducer('TripMeModel', (data: unknown) => {
    if (!(data instanceof Model)) return

    const entry = Object.entries(MODELS).find(([, Ctor]) => data.constructor === Ctor)
    if (!entry) return

    return { model: entry[0] as ModelName, properties: data.toObject() } satisfies SerialisedModel
  })

  definePayloadReviver('TripMeModel', ({ model, properties }: SerialisedModel) => {
    const Ctor = MODELS[model] as unknown as (new (props: unknown) => Model) | undefined
    return Ctor ? new Ctor(properties) : properties
  })
})
