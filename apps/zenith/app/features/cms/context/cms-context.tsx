import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { AboutData } from '../types/about';
import { EMPTY_ABOUT } from '../types/about';
import type { Skill, Solution } from '../types/assets';
import type { ContactData } from '../types/contact';
import { EMPTY_CONTACT } from '../types/contact';
import type { HistoryItem } from '../types/history';
import type { HomeData } from '../types/home';
import { EMPTY_HOME } from '../types/home';

export type Locale = 'en' | 'pt';

export interface CmsState {
  home: Record<Locale, HomeData>;
  about: Record<Locale, AboutData>;
  experience: Record<Locale, HistoryItem[]>;
  education: Record<Locale, HistoryItem[]>;
  skills: Record<Locale, Skill[]>;
  solutions: Record<Locale, Solution[]>;
  contact: Record<Locale, ContactData>;
}

type SectionData =
  | HomeData
  | AboutData
  | HistoryItem[]
  | Skill[]
  | Solution[]
  | ContactData;

interface CmsContextType {
  state: CmsState;
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  updateSection: (section: keyof CmsState, data: SectionData) => void;
  isSaving: boolean;
  saveChanges: () => Promise<void>;
  isPublished: boolean;
  setPublished: (published: boolean) => void;
}

const INITIAL_STATE: CmsState = {
  home: {
    en: { ...EMPTY_HOME, id: 'home-en', locale: 'en' },
    pt: { ...EMPTY_HOME, id: 'home-pt', locale: 'pt' },
  },
  about: {
    en: { ...EMPTY_ABOUT, id: 'about-en', locale: 'en' },
    pt: { ...EMPTY_ABOUT, id: 'about-pt', locale: 'pt' },
  },
  experience: { en: [], pt: [] },
  education: { en: [], pt: [] },
  skills: { en: [], pt: [] },
  solutions: { en: [], pt: [] },
  contact: {
    en: { ...EMPTY_CONTACT, id: 'contact-en' },
    pt: { ...EMPTY_CONTACT, id: 'contact-pt' },
  },
};

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CmsState>(INITIAL_STATE);
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const setLocale = useCallback((locale: Locale) => {
    setCurrentLocale(locale);
  }, []);

  const updateSection = useCallback(
    (section: keyof CmsState, data: SectionData) => {
      setState((prev) => {
        const newState = { ...prev };

        if (section === 'home') {
          const homeData = data as HomeData;
          newState.home = {
            en: {
              ...prev.home.en,
              ...(currentLocale === 'en' ? homeData : {}),
              profilePictureId: homeData.profilePictureId,
            },
            pt: {
              ...prev.home.pt,
              ...(currentLocale === 'pt' ? homeData : {}),
              profilePictureId: homeData.profilePictureId,
            },
          };
        } else {
          // Type-safe assignment for other sections
          const updatedSection = {
            ...prev[section],
            [currentLocale]: data,
          };
          // biome-ignore lint/suspicious/noExplicitAny: Necessary due to TypeScript's union key assignment limitations
          (newState as any)[section] = updatedSection;
        }

        return newState;
      });
    },
    [currentLocale],
  );

  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  }, []);

  const value = useMemo(
    () => ({
      state,
      currentLocale,
      setLocale,
      updateSection,
      isSaving,
      saveChanges,
      isPublished,
      setPublished: setIsPublished,
    }),
    [
      state,
      currentLocale,
      isSaving,
      isPublished,
      setLocale,
      updateSection,
      saveChanges,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCmsContext() {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCmsContext must be used within a CmsProvider');
  }
  return context;
}
