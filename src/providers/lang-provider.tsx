import { createContext, useContext, useMemo, useState } from 'react';

export type Language = 'en-US' | 'pt-BR';

export type LangContextProps = {
  lang: Language;
  setLang: (lang: Language) => void;
};
export const LangContext = createContext({} as LangContextProps);

export const useLangContext = () => {
  const context = useContext(LangContext);

  if (!context) {
    throw new Error('useLangContext must be used within a LangProvider');
  }

  return context;
};

type LangInitialStateProps = Pick<LangContextProps, 'lang'>;

const initialState: LangInitialStateProps = {
  lang: 'en-US',
};

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(initialState.lang);

  const memoizedValue = useMemo(() => ({ lang, setLang }), [lang]);

  return <LangContext.Provider value={memoizedValue}>{children}</LangContext.Provider>;
};
