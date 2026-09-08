'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Languages, ChevronDown, Check, Search } from 'lucide-react';
import {
  LocaleCode,
  INDIAN_LANGUAGES,
  RTL_LOCALES,
  translateKey,
} from '@/lib/language/locales';
import styles from './Language.module.css';

export type Locale = LocaleCode;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyOrText: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (text: string) => text,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load saved preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('scrapsetu_language') as Locale | null;
      if (saved && INDIAN_LANGUAGES.some((l) => l.code === saved)) {
        setLocaleState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    try {
      localStorage.setItem('scrapsetu_language', value);
      // Also set lightweight cookie for server SSR consistency
      document.cookie = `scrapsetu_language=${value}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  };

  const isRtl = RTL_LOCALES.includes(locale);

  // Synchronize document dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (typeof document !== 'undefined' && document.body) {
      document.body.dir = isRtl ? 'rtl' : 'ltr';
      if (isRtl) {
        document.documentElement.classList.add('rtl-mode');
        document.body.classList.add('rtl-mode');
      } else {
        document.documentElement.classList.remove('rtl-mode');
        document.body.classList.remove('rtl-mode');
      }
    }
  }, [locale, isRtl]);

  const t = (keyOrText: string) => {
    return translateKey(keyOrText, locale);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRtl }}>
      <div
        id="scrapsetu-app-root"
        dir={isRtl ? 'rtl' : 'ltr'}
        className={isRtl ? 'rtl-layout rtl-mode' : 'ltr-layout'}
        style={{ width: '100%', minHeight: '100%' }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLocale = () => useContext(LanguageContext);

/**
 * Universal T component: translates raw string or structured key
 */
export function T({ children }: { children: React.ReactNode }): React.ReactElement {
  const { t } = useLocale();

  const translateNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      return t(node);
    }
    if (Array.isArray(node)) {
      return node.map(translateNode);
    }
    return node;
  };

  return <>{translateNode(children)}</>;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = INDIAN_LANGUAGES.filter((item) => {
    const term = `${item.name} ${item.nativeName} ${item.searchTerms}`.toLowerCase();
    return term.includes(query.trim().toLowerCase());
  });

  const currentLang = INDIAN_LANGUAGES.find((l) => l.code === locale) || INDIAN_LANGUAGES[0];

  return (
    <div
      className={styles.root}
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <button
        ref={button}
        className={styles.trigger}
        type="button"
        aria-label="Select language / भाषा चुनें"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setQuery('');
        }}
      >
        <Languages size={16} />
        <span className={styles.activeLabel}>{currentLang.nativeName}</span>
        <ChevronDown size={13} className={open ? styles.chevronOpen : ''} />
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Available Indian Languages">
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              autoFocus
              type="search"
              aria-label="Search languages"
              placeholder="Search 18 languages / भाषा खोजें..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div
            role="group"
            aria-label="Languages"
            className={styles.langList}
            onWheel={(e) => e.stopPropagation()}
          >
            {filtered.map((item) => (
              <button
                key={item.code}
                type="button"
                lang={item.code}
                dir={item.direction}
                aria-pressed={locale === item.code}
                className={`${styles.langOption} ${locale === item.code ? styles.langOptionActive : ''}`}
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                  button.current?.focus();
                }}
              >
                <div className={styles.langTextWrap}>
                  <span className={styles.langNative}>{item.nativeName}</span>
                  <span className={styles.langEnglish}>{item.name}</span>
                </div>
                {locale === item.code && <Check size={14} className={styles.checkIcon} />}
              </button>
            ))}

            {filtered.length === 0 && (
              <p className={styles.noMatches}>No matches / कोई परिणाम नहीं</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
