import type {
  AboutData,
  ContactData,
  HistoryItem,
  HomeData,
  Skill,
  Solution,
} from '@repo/appwrite-core/domain';
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  saveAboutSection,
  saveContactSection,
  saveHistorySection,
  saveHomeSection,
  saveSkillsSection,
  saveSolutionsSection,
} from '../../../infrastructure/cms/server';
import {
  useAboutQuery,
  useContactQuery,
  useHistoryQuery,
  useHomeQuery,
  useSkillsQuery,
  useSolutionsQuery,
} from '../hooks/use-cms-queries';
import {
  type AuditResult,
  MaturityAuditService,
} from '../services/maturity-audit-service';

type SectionState<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
};

type CmsContextType = {
  currentLocale: string;
  setLocale: (locale: string) => void;
  // Local states for real-time editing
  home: SectionState<HomeData>;
  about: SectionState<AboutData>;
  experience: SectionState<HistoryItem[]>;
  education: SectionState<HistoryItem[]>;
  skills: SectionState<Skill[]>;
  solutions: SectionState<Solution[]>;
  contact: SectionState<ContactData>;
  // Global audit result (maturity)
  maturity: AuditResult;
  // Generic save dispatcher
  saveSection: (section: string, data: unknown) => Promise<void>;
  isSaving: boolean;
};

const CmsContext = createContext<CmsContextType | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
  const [currentLocale, setLocale] = useState('en');
  const [isSaving, startSaving] = useTransition();

  // 1. Fetch data for all sections
  const homeQuery = useHomeQuery(currentLocale);
  const aboutQuery = useAboutQuery(currentLocale);
  const expQuery = useHistoryQuery('experience', currentLocale);
  const eduQuery = useHistoryQuery('education', currentLocale);
  const skillsQuery = useSkillsQuery(currentLocale);
  const solutionsQuery = useSolutionsQuery(currentLocale);
  const contactQuery = useContactQuery(currentLocale);

  // 2. Compute global maturity audit
  const maturity = useMemo(() => {
    return MaturityAuditService.audit({
      home: (homeQuery.data as HomeData) || null,
      about: (aboutQuery.data as AboutData) || null,
      experience: (expQuery.data as HistoryItem[]) || [],
      education: (eduQuery.data as HistoryItem[]) || [],
      skills: (skillsQuery.data as Skill[]) || [],
      solutions: (solutionsQuery.data as Solution[]) || [],
      contact: (contactQuery.data as ContactData) || null,
    });
  }, [
    homeQuery.data,
    aboutQuery.data,
    expQuery.data,
    eduQuery.data,
    skillsQuery.data,
    solutionsQuery.data,
    contactQuery.data,
  ]);

  const resolveSocialIconId = useCallback(
    (social: ContactData['socials'][number]) => {
      const legacyIconCode =
        'iconCode' in social && typeof social.iconCode === 'string'
          ? social.iconCode
          : undefined;

      return social.iconId || legacyIconCode || 'lucide:link';
    },
    [],
  );

  // 3. Centralized Save Strategy
  const saveSection = useCallback(
    async (section: string, data: unknown) => {
      startSaving(async () => {
        try {
          const payload = { locale: currentLocale, data };
          const saveHome = saveHomeSection as unknown as (args: {
            data: { locale: string; data: HomeData };
          }) => Promise<unknown>;
          const saveAbout = saveAboutSection as unknown as (args: {
            data: { locale: string; data: AboutData };
          }) => Promise<unknown>;
          const saveHistory = saveHistorySection as unknown as (args: {
            data: {
              type: 'experience' | 'education';
              locale: string;
              items: HistoryItem[];
            };
          }) => Promise<unknown>;
          const saveSkills = saveSkillsSection as unknown as (args: {
            data: { locale: string; items: Skill[] };
          }) => Promise<unknown>;
          const saveSolutions = saveSolutionsSection as unknown as (args: {
            data: { locale: string; items: Solution[] };
          }) => Promise<unknown>;
          const saveContact = saveContactSection as unknown as (args: {
            data: { locale: string; data: ContactData };
          }) => Promise<unknown>;

          switch (section) {
            case 'home':
              await saveHome({
                data: payload as { locale: string; data: HomeData },
              });
              await homeQuery.refetch();
              break;
            case 'about':
              await saveAbout({
                data: payload as { locale: string; data: AboutData },
              });
              await aboutQuery.refetch();
              break;
            case 'experience':
              await saveHistory({
                data: {
                  type: 'experience',
                  locale: currentLocale,
                  items: data as HistoryItem[],
                },
              });
              await expQuery.refetch();
              break;
            case 'education':
              await saveHistory({
                data: {
                  type: 'education',
                  locale: currentLocale,
                  items: data as HistoryItem[],
                },
              });
              await eduQuery.refetch();
              break;
            case 'skills':
              await saveSkills({
                data: { locale: currentLocale, items: data as Skill[] },
              });
              await skillsQuery.refetch();
              break;
            case 'solutions':
              await saveSolutions({
                data: { locale: currentLocale, items: data as Solution[] },
              });
              await solutionsQuery.refetch();
              break;
            case 'contact': {
              const contactData = data as ContactData;
              const normalizedContact: ContactData = {
                ...contactData,
                socials: (contactData.socials || []).map((social) => ({
                  ...social,
                  iconId: resolveSocialIconId(social),
                })),
              };

              await saveContact({
                data: { locale: currentLocale, data: normalizedContact },
              });
              await contactQuery.refetch();
              break;
            }
          }
        } catch (error) {
          console.error(`[Zenith] Failed to save section ${section}:`, error);
        }
      });
    },
    [
      currentLocale,
      homeQuery,
      aboutQuery,
      expQuery,
      eduQuery,
      skillsQuery,
      solutionsQuery,
      contactQuery,
      resolveSocialIconId,
    ],
  );

  const value = useMemo(
    () => ({
      currentLocale,
      setLocale,
      home: {
        data: homeQuery.data as HomeData,
        isLoading: homeQuery.isLoading,
        isError: homeQuery.isError,
      },
      about: {
        data: aboutQuery.data as AboutData,
        isLoading: aboutQuery.isLoading,
        isError: aboutQuery.isError,
      },
      experience: {
        data: expQuery.data as HistoryItem[],
        isLoading: expQuery.isLoading,
        isError: expQuery.isError,
      },
      education: {
        data: eduQuery.data as HistoryItem[],
        isLoading: eduQuery.isLoading,
        isError: eduQuery.isError,
      },
      skills: {
        data: skillsQuery.data as Skill[],
        isLoading: skillsQuery.isLoading,
        isError: skillsQuery.isError,
      },
      solutions: {
        data: solutionsQuery.data as Solution[],
        isLoading: solutionsQuery.isLoading,
        isError: solutionsQuery.isError,
      },
      contact: {
        data: contactQuery.data as ContactData,
        isLoading: contactQuery.isLoading,
        isError: contactQuery.isError,
      },
      maturity,
      saveSection,
      isSaving,
    }),
    [
      currentLocale,
      homeQuery,
      aboutQuery,
      expQuery,
      eduQuery,
      skillsQuery,
      solutionsQuery,
      contactQuery,
      maturity,
      saveSection,
      isSaving,
    ],
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCmsContext() {
  const context = use(CmsContext);
  if (!context) {
    throw new Error('useCmsContext must be used within a CmsProvider');
  }
  return context;
}
