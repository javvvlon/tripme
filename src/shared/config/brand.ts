import type { TLocale } from './locales'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const BRAND_NAME = 'TripMe'

export const AGENCY_PHONE = '+998936445555'

export const AGENCY_EMAIL = 'hi@tripme.uz'

export const AGENCY_HOURS = 'Mo-Sa 09:00-18:00'

export const FAVICON_VERSION = '1.0'

export const OFFICE_VISIT_ADDRESS: Record<TLocale, string> = {
  ru: 'Республика Узбекистан, г. Фергана, ул. Б. Маргилоний, д. 129',
  uz: "O'zbekiston Respublikasi, Farg'ona shahri, B. Marg'iloniy ko'chasi, 129-uy",
  en: "129 B. Marg'iloniy Street, Fergana, Republic of Uzbekistan",
}

export const LEGAL_ADDRESS: Record<TLocale, string> = {
  ru: 'Республика Узбекистан, Ферганская область, г. Фергана, Ибрат МФЙ, ул. Б. Маргилоний, д. 129, кв. 1',
  uz: 'O‘zbekiston Respublikasi, Farg‘ona viloyati, Farg‘ona sh., Ibrat MFY, B. Marg‘iloniy ko‘chasi, 129-uy, 1-xonadon',
  en: 'Apt. 1, 129 B. Marg‘iloniy Street, Ibrat MFY, Fergana, Fergana Region, Republic of Uzbekistan',
}

export const AGENCY_POSTAL_ADDRESS = {
  '@type': 'PostalAddress',
  'streetAddress': 'ул. Б. Маргилоний, д. 129, кв. 1',
  'addressLocality': 'Фергана',
  'addressRegion': 'Ферганская область',
  'postalCode': '150100',
  'addressCountry': 'UZ',
} as const
