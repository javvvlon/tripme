import type { IAnalyticsReport } from '../contracts/analytics'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useAnalyticsRepository = () => {
  const http = useHttp()

  const report = async (from: string, to: string): Promise<IAnalyticsReport> => {
    const response = await http.call<IAnalyticsReport>('Analytics', 'report', { from, to })

    return response.data
  }

  return { report }
}
