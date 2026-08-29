/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const CONTACT_CHANNELS = [
  { key: 'email', icon: 'mail', valueKey: 'contact.channels.emailValue', href: 'mailto:hi@tripme.uz' },
  { key: 'chat', icon: 'support', valueKey: 'contact.channels.chatValue', href: null },
  { key: 'office', icon: 'pin', valueKey: 'contact.channels.officeValue', href: null },
  { key: 'phone', icon: 'phone', valueKey: 'contact.channels.phoneValue', href: 'tel:+998770000000' },
] as const

export const MESSAGE_MAX = 2000
