import legacyData from './legacy-data.json' with { type: 'json' };

export interface LegacyData {
  home: Record<string, unknown>[];
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  about: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  solutions: Record<string, unknown>[];
  socials: Record<string, unknown>[];
  contactInfo: Record<string, unknown>[];
  metricSources: Record<string, unknown>[];
  impactMetrics: Record<string, unknown>[];
}

interface HomeData {
  firstName: string;
  lastName: string;
  profilePictureId: string;
  journeyStartedIn: number;
  translations: Record<string, Record<string, string>>;
  socials: Record<string, unknown>[];
  [key: string]: unknown;
}

interface ExperienceItem {
  company: string;
  position: string | Record<string, string>;
  duration: string | Record<string, string>;
  sort: number;
  [key: string]: unknown;
}

interface EducationItem {
  institution: string;
  degree: string | Record<string, string>;
  duration: string | Record<string, string>;
  sort: number;
  [key: string]: unknown;
}

interface SolutionItem {
  icon: string;
  sort: number;
  translations: Record<string, Record<string, string>>;
  [key: string]: unknown;
}

interface SkillItem {
  title: string;
  icon: string;
  type: string;
  [key: string]: unknown;
}

interface ContactItem {
  type: string;
  value: string;
  icon: string;
  sort: number;
  [key: string]: unknown;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern for centralized data parsing
export class DataParser {
  static parse(): LegacyData {
    // biome-ignore lint/suspicious/noExplicitAny: Raw JSON from Directus export needs initial any cast for structured access
    const raw = legacyData as any;
    const data = {
      home: raw.home as HomeData,
      about: raw.about,
      experience: raw.experience as ExperienceItem[],
      education: raw.education as EducationItem[],
      skills: raw.skills as SkillItem[],
      solutions: raw.solutions as SolutionItem[],
      contactInfo: raw.contactInfo as ContactItem[],
      metricSources: raw.metricSources as Record<string, unknown>[],
      impactMetrics: raw.impactMetrics as Record<string, unknown>[],
    };
    const locales = ['en', 'pt'];

    // 1. Flatten Home
    const homeRows = locales.map((lang) => {
      const trans = data.home.translations?.[lang] || {};
      const sanitizedTrans = { ...trans };
      delete sanitizedTrans.cvFileId; // Exclude internal ID from Appwrite row

      return {
        ...sanitizedTrans,
        firstName: data.home.firstName,
        lastName: data.home.lastName,
        pictureId: data.home.profilePictureId,
        cvId: trans.cvFileId || 'cv-pdf', // Map to correct schema key
        journeyStartedIn: data.home.journeyStartedIn,
        locale: lang,
      };
    });

    // 1b. Flatten About
    const aboutRows = locales.map((lang) => {
      // biome-ignore lint/suspicious/noExplicitAny: Required for legacy object parsing
      const langData = (data.about as any)?.[lang] || {};
      return {
        content: langData.description || '',
        locale: lang,
      };
    });

    // 2. Flatten Experience
    const experienceRows: Record<string, unknown>[] = [];
    for (const exp of data.experience) {
      for (const lang of locales) {
        experienceRows.push({
          company: exp.company,
          position:
            typeof exp.position === 'string'
              ? exp.position
              : (exp.position as Record<string, string>)?.[lang] ||
                (exp.position as Record<string, string>)?.en,
          duration:
            typeof exp.duration === 'string'
              ? exp.duration
              : (exp.duration as Record<string, string>)?.[lang] ||
                (exp.duration as Record<string, string>)?.en,
          sort: exp.sort,
          locale: lang,
        });
      }
    }

    // 3. Flatten Education
    const educationRows: Record<string, unknown>[] = [];
    for (const edu of data.education) {
      for (const lang of locales) {
        educationRows.push({
          institution: edu.institution,
          degree:
            typeof edu.degree === 'string'
              ? edu.degree
              : (edu.degree as Record<string, string>)?.[lang] ||
                (edu.degree as Record<string, string>)?.en,
          duration:
            typeof edu.duration === 'string'
              ? edu.duration
              : (edu.duration as Record<string, string>)?.[lang] ||
                (edu.duration as Record<string, string>)?.en,
          sort: edu.sort,
          locale: lang,
        });
      }
    }

    // 4. Flatten Solutions
    const solutionsRows: Record<string, unknown>[] = [];
    let solIdx = 1;
    for (const sol of data.solutions) {
      for (const lang of locales) {
        solutionsRows.push({
          title: sol.translations?.[lang]?.title || sol.translations?.en?.title,
          description:
            sol.translations?.[lang]?.description ||
            sol.translations?.en?.description,
          iconCode: sol.icon,
          sort: sol.sort || solIdx,
          locale: lang,
        });
      }
      solIdx++;
    }

    // 5. Socials & Skills are mostly flat
    const socialsRows = (data.home.socials || []).map(
      (s: Record<string, unknown>, idx: number) => ({
        type: s.type,
        url: s.url,
        iconCode: s.icon, // Map icon to iconCode
        sort: idx + 1,
        status: 'active',
      }),
    );

    const skillsRows = (data.skills || []).map((s: SkillItem, idx: number) => ({
      title: s.title,
      iconCode: s.icon, // Map icon to iconCode
      type: s.type,
      sort: idx + 1,
      locale: 'en',
      status: 'active',
    }));

    const contactRows = (data.contactInfo || []).map(
      (c: ContactItem, idx: number) => ({
        type: c.type,
        value: c.value,
        iconCode: c.icon, // Map icon to iconCode
        sort: c.sort || idx + 1,
        locale: 'en',
      }),
    );

    const metricSourcesRows = data.metricSources || [];
    const impactMetricsRows = data.impactMetrics || [];

    return {
      home: homeRows,
      about: aboutRows,
      experience: experienceRows,
      education: educationRows,
      skills: skillsRows,
      solutions: solutionsRows,
      socials: socialsRows,
      contactInfo: contactRows,
      metricSources: metricSourcesRows,
      impactMetrics: impactMetricsRows,
    };
  }

  static getBatches(
    data: LegacyData,
  ): { tableId: string; rows: Record<string, unknown>[] }[] {
    return [
      { tableId: 'home', rows: data.home },
      { tableId: 'about', rows: data.about },
      { tableId: 'metric_sources', rows: data.metricSources },
      { tableId: 'impact_metrics', rows: data.impactMetrics },
      { tableId: 'experience', rows: data.experience },
      { tableId: 'education', rows: data.education },
      { tableId: 'skills', rows: data.skills },
      { tableId: 'solutions', rows: data.solutions },
      { tableId: 'socials', rows: data.socials },
      { tableId: 'contact_info', rows: data.contactInfo },
    ];
  }
}
