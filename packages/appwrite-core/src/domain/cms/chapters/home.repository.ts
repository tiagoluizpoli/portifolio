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

export class HomeRepository extends BaseCmsRepository<HomeEntity> {
  protected mapToEntity(doc: any): HomeEntity {
    return {
      id: doc.$id,
      name: doc.name || '',
      tagline: doc.tagline ? JSON.parse(doc.tagline) : { en: '', pt: '' },
      bio: doc.bio ? JSON.parse(doc.bio) : { en: '', pt: '' },
      profilePic: doc.profilePic,
    };
  }

  protected mapToDb(data: Partial<HomeEntity>): any {
    const dbData: any = { ...data };
    if (data.tagline) dbData.tagline = JSON.stringify(data.tagline);
    if (data.bio) dbData.bio = JSON.stringify(data.bio);
    return dbData;
  }
}
