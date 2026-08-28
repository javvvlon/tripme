/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CONTACT_CHANNELS = [
  { key: 'email', icon: 'inbox', valueKey: 'contact.channels.emailValue', href: 'mailto:hi@tripme.uz' },
  { key: 'chat', icon: 'support', valueKey: 'contact.channels.chatValue', href: null },
  { key: 'office', icon: 'pin', valueKey: 'contact.channels.officeValue', href: null },
  { key: 'phone', icon: 'help', valueKey: 'contact.channels.phoneValue', href: 'tel:+998770000000' },
] as const

export const PHONE_PREFIX = '+998'

export const MESSAGE_MAX = 2000
