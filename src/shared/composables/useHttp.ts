import type { HttpConnector } from '~/shared/services/api/service'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useHttp = (): HttpConnector => {
  const { $http } = useNuxtApp()

  if (!$http) {
    throw new Error('useHttp() called before the http plugin was installed.')
  }

  return $http as HttpConnector
}
