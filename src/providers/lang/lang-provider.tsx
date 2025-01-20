import type { Translatable } from '@/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { LangContext, type LangContextProps, type Language } from './lang-context';

type LangInitialStateProps = Pick<LangContextProps, 'lang'>;

const initialState: LangInitialStateProps = {
  lang: 'en-US',
};

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(initialState.lang);
  const [language, setLanguage] = useState<Language>('en-US');

  const getTranslation = <T,>(translations: (T extends Translatable ? T : Translatable)[]): T => {
    const translation = translations.find((t) => t.directus_translations_id.language === lang);

    return (translation ?? translations[0]) as T;
  };

  const duration = 0.5;
  const customSetLang = (language: Language) => {
    setLanguage(language);
    setTimeout(() => setLang(language), duration * 1000);
  };

  const memoizedValue = useMemo(() => ({ lang, setLang: customSetLang, getTranslation }), [lang]);

  return (
    <LangContext.Provider value={memoizedValue}>
      <AnimatePresence mode="wait">
        <motion.div
          key={language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration,
            ease: 'easeInOut',
          }}
        >
          <div>{children}</div>
        </motion.div>
      </AnimatePresence>
    </LangContext.Provider>
  );
};
