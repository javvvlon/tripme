/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export default defineNuxtPlugin({
  name: 'theme',

  setup() {
    const router = useRouter()
    const theme = useTheme()

    theme.preference.value = theme.stored()

    router.afterEach(to => theme.apply(to))
  },
})
