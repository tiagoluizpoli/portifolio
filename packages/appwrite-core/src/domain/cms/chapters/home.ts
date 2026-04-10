/**
 * Home Domain Model (Constitution §XVII)
 * Section 01: Hero Identity & Journey.
 */

export interface HomeData {
  id: string; // Required for maturity, but can be empty string if not saved
  locale: string;
  firstName: string;
  lastName: string;
  namePresentation: string;
  title: string;
  description: string;
  pictureId?: string; // Optional (Asset Reference)
  cvId?: string; // Optional (Asset Reference)
  downloadButtonText: string;
  journeyStartedIn: number;
}
