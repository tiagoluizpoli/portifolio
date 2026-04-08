import type { Models } from 'node-appwrite';
import { BaseCmsRepository } from '../base-cms.repository';

/**
 * HomeRepository: Chapter 01 (The Identity) 🎯 MVP
 * Implements the persistence logic for the Home chapter.
 */

export interface HomeEntity {
  id: string;
  name: string;
  tagline: { en: string; pt: string };
  bio: { en: string; pt: string };
  profilePic?: string; // fileId
}

type HomeDocument = Models.Document & {
  name?: string;
  tagline?: string;
  bio?: string;
  profilePic?: string;
};

export class HomeRepository extends BaseCmsRepository<HomeEntity> {
  protected mapToEntity(doc: HomeDocument): HomeEntity {
    return {
      id: doc.$id,
      name: doc.name || '',
      tagline: doc.tagline ? JSON.parse(doc.tagline) : { en: '', pt: '' },
      bio: doc.bio ? JSON.parse(doc.bio) : { en: '', pt: '' },
      profilePic: doc.profilePic,
    };
  }

  protected mapToDb(data: Partial<HomeEntity>): Record<string, unknown> {
    const dbData: Record<string, unknown> = { ...data };
    if (data.tagline) dbData.tagline = JSON.stringify(data.tagline);
    if (data.bio) dbData.bio = JSON.stringify(data.bio);
    return dbData;
  }
}
