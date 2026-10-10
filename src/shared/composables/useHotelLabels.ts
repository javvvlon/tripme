/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useHotelLabels = () => {
  const labels = useState<Record<string, string>>('hotel-labels', () => ({}))

  const remember = (key: string | undefined, name: string) => {
    if (!key || !name || labels.value[key]) return

    labels.value = { ...labels.value, [key]: name }
  }

  const labelOf = (key: string): string => labels.value[key] ?? key

  return { labels, remember, labelOf }
}
