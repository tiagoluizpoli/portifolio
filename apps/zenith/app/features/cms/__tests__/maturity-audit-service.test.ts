import { describe, expect, it } from 'vitest';
import type { AuditData } from '../services/maturity-audit-service';
import { MaturityAuditService } from '../services/maturity-audit-service';

const emptyData: AuditData = {
  home: {
    id: 'home-en',
    locale: 'en',
    firstName: '',
    lastName: '',
    namePresentation: '',
    title: '',
    description: '',
    pictureId: '',
    cvId: '',
    downloadButtonText: '',
    journeyStartedIn: 2020,
  },
  about: { id: 'about-en', locale: 'en', content: '', metrics: [] },
  experience: [],
  education: [],
  skills: [],
  solutions: [],
  contact: {
    id: 'contact-en',
    locale: 'en',
    email: '',
    phone: '',
    location: '',
    socials: [],
  },
};

const fullData: AuditData = {
  home: {
    id: 'home-en',
    locale: 'en',
    firstName: 'Tiago',
    lastName: 'Luiz',
    namePresentation: 'Tiago Luiz',
    title: 'Dev',
    description: 'Bio long enough to pass validation',
    pictureId: 'img123',
    cvId: 'cv123',
    downloadButtonText: 'Download',
    journeyStartedIn: 2010,
  },
  about: {
    id: 'about-en',
    locale: 'en',
    content:
      'Professional software architect with over a decade of experience in distributed systems and cloud native infrastructure. Specializing in high-performance applications.',
    metrics: [],
  },
  experience: [
    {
      id: 'exp-1',
      type: 'experience',
      locale: 'en',
      title: 'Engineer',
      organization: 'Acme',
      location: 'SP',
      period: '2020',
      description: 'Did stuff with impact.',
      current: true,
      sort: 0,
    },
  ],
  education: [
    {
      id: 'edu-1',
      type: 'education',
      locale: 'en',
      title: 'BSc CS',
      organization: 'University',
      location: 'SP',
      period: '2015',
      description: 'Studied hard and learned.',
      current: false,
      sort: 0,
    },
  ],
  skills: [
    {
      id: 'sk-1',
      title: 'TypeScript',
      type: 'frontend',
      iconCode: 'lucide:code',
      status: 'active',
      sort: 0,
    },
    {
      id: 'sk-2',
      title: 'Node.js',
      type: 'backend',
      iconCode: 'lucide:server',
      status: 'active',
      sort: 1,
    },
    {
      id: 'sk-3',
      title: 'React',
      type: 'frontend',
      iconCode: 'lucide:layout',
      status: 'active',
      sort: 2,
    },
  ],
  solutions: [
    {
      id: 'sol-1',
      locale: 'en',
      title: 'My App',
      description: 'A great app that solves problems.',
      iconCode: 'lucide:rocket',
      sort: 0,
    },
    {
      id: 'sol-2',
      locale: 'en',
      title: 'API Gateway',
      description: 'Scalable routing and auth solution.',
      iconCode: 'lucide:shield',
      sort: 1,
    },
  ],
  contact: {
    id: 'contact-en',
    locale: 'en',
    email: 'test@test.com',
    phone: '123',
    location: 'SP',
    socials: [
      {
        id: 'gh',
        platformId: 'github',
        username: 'tiagoluizpoli',
        iconId: 'lucide:github',
        active: true,
        sort: 0,
      },
    ],
  },
};

describe('MaturityAuditService', () => {
  it('should calculate 0% progress for empty data', () => {
    const result = MaturityAuditService.audit(emptyData);
    expect(result.progress).toBe(0);
    expect(result.status).toBe('pending');
  });

  it('should calculate 100% progress for complete data', () => {
    const result = MaturityAuditService.audit(fullData);
    expect(result.progress).toBe(100);
    expect(result.status).toBe('mature');
  });
});
