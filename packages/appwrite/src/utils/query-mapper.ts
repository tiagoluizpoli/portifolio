import { Query } from 'node-appwrite';
import type { RepositoryQueryOptions } from '../repositories/interfaces.js';

/**
 * Utility to map domain-native query options to Appwrite SDK Query strings.
 * This encapsulates the infrastructure-specific query construction.
 */
export const QueryMapper = {
  /**
   * Translates high-level query options into an array of Appwrite Query strings.
   */
  toAppwriteQueries(options: RepositoryQueryOptions = {}): string[] {
    const queries: string[] = [];

    if (options.limit !== undefined) {
      queries.push(Query.limit(options.limit));
    }

    if (options.offset !== undefined) {
      queries.push(Query.offset(options.offset));
    }

    return queries;
  },
};
