import { LocaleCode, TranslationSchema } from './types';
import { en } from './en';
import { hi } from './hi';
import { bn } from './bn';
import { te } from './te';
import { mr } from './mr';
import { ta } from './ta';
import { gu } from './gu';
import { kn } from './kn';
import { ml } from './ml';
import { pa } from './pa';
import { or } from './or';
import { as } from './as';
import { ur } from './ur';
import { mai } from './mai';
import { ne } from './ne';
import { kok } from './kok';
import { sd } from './sd';
import { dog } from './dog';
import { dictionary as legacyDictionary } from '../dictionary';

import { REGIONAL_DICTIONARY } from './regional-dictionary';

export * from './types';
export * from './registry';
export * from './regional-dictionary';

export const LOCALES: Record<LocaleCode, TranslationSchema> = {
  en,
  hi,
  bn,
  te,
  mr,
  ta,
  gu,
  kn,
  ml,
  pa,
  or,
  as,
  ur,
  mai,
  ne,
  kok,
  sd,
  dog,
};

/**
 * Universal translator supporting:
 * 1. Structured dot-notation keys (e.g. 'auth.verifyWithAadhaar')
 * 2. Site-wide UI regional dictionary across all 18 languages
 * 3. Legacy dictionary for Hindi ([0]) and Marathi ([1])
 * 4. Automatic fallback to English structured keys or raw string
 */
export function translateKey(key: string, locale: LocaleCode = 'en'): string {
  if (!key) return '';

  const normalized = key.trim();

  // 1. Check structured keys in selected locale
  const localeDict = LOCALES[locale] as Record<string, string> | undefined;
  if (localeDict && localeDict[normalized]) {
    return localeDict[normalized];
  }

  // 2. Check site-wide UI regional dictionary for the selected locale
  const regionalDict = REGIONAL_DICTIONARY[locale];
  if (regionalDict && regionalDict[normalized]) {
    return regionalDict[normalized];
  }

  // 3. Check legacy raw string dictionary (Hindi: index 0, Marathi: index 1)
  if (locale === 'hi' && legacyDictionary[normalized]?.[0]) {
    return legacyDictionary[normalized][0];
  }
  if (locale === 'mr' && legacyDictionary[normalized]?.[1]) {
    return legacyDictionary[normalized][1];
  }

  // 4. Fallback to English structured keys
  const enDict = LOCALES['en'] as Record<string, string>;
  if (enDict && enDict[normalized]) {
    return enDict[normalized];
  }

  // 5. Return original raw string
  return key;
}
