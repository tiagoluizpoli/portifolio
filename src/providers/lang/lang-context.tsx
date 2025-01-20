import type { Translatable } from '@/core/entities';
import { createContext, useContext } from 'react';

export type Language = 'en-US' | 'pt-BR';

export type LangContextProps = {
  lang: Language;
  setLang: (lang: Language) => void;
  getTranslation: <T>(translations: (T extends Translatable ? T : Translatable)[]) => T;
};

export const LangContext = createContext({} as LangContextProps);

export const useLangContext = () => {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error('useLangContext must be used within a LangProvider');
  }

  return context;
};
