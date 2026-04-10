import { describe, expect, it } from 'vitest';
import type { Skill } from './assets.js';

describe('Skill Domain Globalization', () => {
  it('should represent a globalized skill without locale or level', () => {
    const skill: Skill = {
      id: 'skill-1',
      title: 'TypeScript',
      type: 'backend',
      iconCode: 'devicon-typescript',
      status: 'active',
    };

    expect(skill).toHaveProperty('title');
    expect(skill).not.toHaveProperty('locale');
    expect(skill).not.toHaveProperty('level');
  });
});
