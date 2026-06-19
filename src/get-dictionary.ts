import 'server-only';
import type { Locale } from './i18n-config';

const dictionaries = {
  ua: () => import('./dictionaries/ua.json').then((module) => module.default),
  cz: () => import('./dictionaries/cz.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
