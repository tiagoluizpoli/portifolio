import { validateAppwriteEnv } from '@repo/appwrite-core';
import type { HomeData } from '@repo/appwrite-core/domain';
import { AppwriteProvider, CmsService } from '@repo/appwrite-core/server';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding Appwrite CMS with mock data...');

  try {
    const config = validateAppwriteEnv(
      process.env as Record<string, string | undefined>,
    );

    AppwriteProvider.initialize(config);
    const service = new CmsService(
      AppwriteProvider.client,
      config.APPWRITE_DATABASE_ID,
    );

    const locales = ['en', 'pt'];

    for (const locale of locales) {
      console.log(`  [${locale}] Seeding Home...`);
      const homeData: Omit<HomeData, 'id'> = {
        firstName: 'Tiago',
        lastName: 'Poli',
        namePresentation:
          locale === 'en' ? 'Tiago Poli / Architect' : 'Tiago Poli / Arquiteto',
        title:
          locale === 'en'
            ? 'Crafting Antigravity Code'
            : 'Codificando em Antigravidade',
        description:
          locale === 'en'
            ? 'Fullstack developer specialized in high-fidelity systems.'
            : 'Desenvolvedor Fullstack especializado em sistemas de alta fidelidade.',
        downloadButtonText:
          locale === 'en' ? 'Download Resume' : 'Baixar Currículo',
        journeyStartedIn: 2018,
        locale,
        pictureId: '',
        cvId: '',
      };
      await service.saveHome(locale, homeData);

      console.log(`  [${locale}] Seeding About...`);
      await service.saveAbout(locale, {
        locale,
        content:
          locale === 'en'
            ? 'I am a software engineer specializing in high-fidelity, monorepo architectures and elite developer experiences. With 5+ years of experience, I architect solutions that transcend the ordinary.'
            : 'Eu sou um engenheiro de software especializado em arquiteturas monorepo de alta fidelidade e experiências de desenvolvedor de elite. Com mais de 5 anos de experiência, projeto soluções que transcendem o ordinário.',
        metrics: [
          {
            id: 'metric-1',
            aboutId: 'about-1',
            internalCode: 'lines-of-code',
            locale,
            label: 'Lines of Code',
            value: '1M+',
            sourceId: 'manual',
          },
          {
            id: 'metric-2',
            aboutId: 'about-1',
            internalCode: 'coffee-cups',
            locale,
            label: 'Coffee Cups',
            value: '500+',
            sourceId: 'manual',
          },
        ],
      });

      console.log(`  [${locale}] Seeding History...`);
      await service.saveHistory('experience', locale, [
        {
          id: 'exp-1',
          locale,
          type: 'experience',
          title: locale === 'en' ? 'Senior Architect' : 'Arquiteto Sênior',
          organization: 'Vertex Corp',
          location: 'Remote',
          period: '2021 — Present',
          description: 'Leading global infrastructure and AI orchestration.',
          current: true,
          sort: 0,
        },
      ]);

      console.log(`  [${locale}] Seeding Skills...`);
      await service.saveSkills(locale, [
        {
          id: 'skill-1',
          title: 'React',
          type: 'frontend',
          sort: 0,
          iconCode: 'lucide:code',
          status: 'active',
        },
        {
          id: 'skill-2',
          title: 'Node.js',
          type: 'backend',
          sort: 1,
          iconCode: 'lucide:server',
          status: 'active',
        },
      ]);
    }

    console.log('✅ Seeding Complete!');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seed();
