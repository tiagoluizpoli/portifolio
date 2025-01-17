import type { Translatable } from '@/core';
import { useMemo, useState } from 'react';
import { LangContext, type LangContextProps, type Language } from './lang-context';

type LangInitialStateProps = Pick<LangContextProps, 'lang'>;

const initialState: LangInitialStateProps = {
  lang: 'en-US',
};

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(initialState.lang);

  const getTranslation = <T,>(translations: (T extends Translatable ? T : Translatable)[]): T => {
    const translation = translations.find((t) => t.directus_translations_id.language === lang);

    return (translation ?? translations[0]) as T;
  };

  const memoizedValue = useMemo(() => ({ lang, setLang, getTranslation }), [lang]);

  return <LangContext.Provider value={memoizedValue}>{children}</LangContext.Provider>;
};
