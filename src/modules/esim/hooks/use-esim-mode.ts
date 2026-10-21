import { useEsimRepository } from '~/modules/esim/repositories'
import type { IEsimMode } from '~/modules/esim/contracts/esim'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useEsimMode = () => {
  const { mode } = useEsimRepository()

  const { data: setup } = useAsyncData('esim:mode', () => mode().catch((): IEsimMode => ({ mode: 'catalog', provider: null })), {
    default: (): IEsimMode => ({ mode: 'checkout', provider: null }),
  })

  const affiliate = computed(() => (setup.value.mode === 'affiliate' ? setup.value.affiliate ?? null : null))

  return { setup, affiliate }
}
