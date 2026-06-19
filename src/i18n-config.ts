export const i18n = {
  defaultLocale: 'ua',
  locales: ['ua', 'cz'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
