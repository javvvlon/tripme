/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
function russianRule(choice: number): number {
  if (choice === 0) return 0

  const teen = choice % 100 > 10 && choice % 100 < 20
  const lastDigit = choice % 10

  if (!teen && lastDigit === 1) return 1
  if (!teen && lastDigit >= 2 && lastDigit <= 4) return 2

  return 3
}

function uzbekRule(choice: number): number {
  return choice === 0 ? 0 : 3
}

function englishRule(choice: number): number {
  if (choice === 0) return 0
  return choice === 1 ? 1 : 3
}

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'ru',
  missingWarn: false,
  fallbackWarn: false,
  pluralRules: {
    ru: russianRule,
    uz: uzbekRule,
    en: englishRule,
  },
}))
