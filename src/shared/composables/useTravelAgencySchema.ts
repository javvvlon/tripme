import { AGENCY_EMAIL, AGENCY_HOURS, AGENCY_PHONE } from '~/shared/config/brand'
import { LOCALES } from '~/shared/config/locales'
import { OG_IMAGE, SITE_NAME } from '~/shared/config/seo'
import { useSiteUrl } from './useSiteUrl'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTravelAgencySchema = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { absolute } = useSiteUrl()

  return computed(() => ({
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${absolute('/')}#agency`,
    'name': SITE_NAME,
    'url': absolute(localePath('/')),
    'logo': absolute('/tripme-logo.png'),
    'image': absolute(OG_IMAGE.path),
    'email': AGENCY_EMAIL,
    'telephone': AGENCY_PHONE,
    'areaServed': 'UZ',
    'openingHours': AGENCY_HOURS,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': t('contact.channels.officeValue'),
      'addressLocality': t('footer.city'),
      'addressCountry': 'UZ',
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'telephone': AGENCY_PHONE,
      'email': AGENCY_EMAIL,
      'availableLanguage': [...LOCALES],
    },
  }))
}
