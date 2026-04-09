import { describe, expect, it } from 'vitest';
import type { AuditData } from '../services/maturity-audit-service';
import { MaturityAuditService } from '../services/maturity-audit-service';

const emptyData: AuditData = {
  home: {
    id: 'home-en',
    locale: 'en',
    name: '',
    title: '',
    description: '',
    profilePictureId: '',
    cvId: '',
  },
  about: { id: 'about-en', locale: 'en', content: '', stats: [] },
  experience: [],
  education: [],
  skills: [],
  solutions: [],
  contact: {
    id: 'contact-en',
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
    name: 'Tiago',
    title: 'Dev',
    description: 'Bio',
    profilePictureId: 'img123',
    cvId: 'cv123',
  },
  about: { id: 'about-en', locale: 'en', content: 'About me', stats: [] },
  experience: [
    {
      id: 'exp-1',
      type: 'experience',
      locale: 'en',
      mainTitle: 'Engineer',
      subTitle: 'Acme',
      location: 'SP',
      from: '2020',
      to: null,
      current: true,
      content: 'Did stuff',
      sort: 0,
    },
  ],
  education: [
    {
      id: 'edu-1',
      type: 'education',
      locale: 'en',
      mainTitle: 'BSc CS',
      subTitle: 'University',
      location: 'SP',
      from: '2015',
      to: '2019',
      current: false,
      content: 'Studied hard',
      sort: 0,
    },
  ],
  skills: [
    {
      id: 'sk-1',
      name: 'TypeScript',
      category: 'hard' as const,
      icon: 'lucide:code',
      status: 'active',
    },
  ],
  solutions: [
    {
      id: 'sol-1',
      title: 'My App',
      description: 'A great app',
      icon: 'lucide:rocket',
      url: 'https://myapp.com',
    },
  ],
  contact: {
    id: 'contact-en',
    email: 'test@test.com',
    phone: '123',
    location: 'SP',
    socials: [{ id: 'gh', type: 'github', url: 'github.com', active: true }],
  },
};

describe('MaturityAuditService', () => {
  it('should calculate 0% progress for empty data (all fields empty strings)', () => {
    const result = MaturityAuditService.audit(emptyData);
    expect(result.progress).toBe(0);
    expect(result.status).toBe('pending');
  });

  it('should calculate 100% progress for complete home data (aligned with profilePictureId)', () => {
    const result = MaturityAuditService.audit(fullData);
    expect(result.progress).toBe(100);
    expect(result.status).toBe('mature');
  });
});
