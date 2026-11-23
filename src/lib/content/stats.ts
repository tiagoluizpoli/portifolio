import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Database } from './db';
import { content } from './table';

const STATS_KEY = 'github_stats';
const GITHUB_LOGIN = 'tiagoluizpoli';

export const githubStats = z.object({
  contributions: z.number().int().nonnegative(),
  publicRepos: z.number().int().nonnegative(),
  languages: z.array(z.string().min(1)).min(1).max(5),
  fetchedAt: z.iso.datetime(),
});
export type GithubStats = z.infer<typeof githubStats>;

/** Validated snapshot, or undefined when the row is absent or invalid (both mean "refetch"). */
export async function readStatsSnapshot(db: Database): Promise<GithubStats | undefined> {
  const [row] = await db.select().from(content).where(eq(content.key, STATS_KEY));
  const parsed = githubStats.safeParse(row?.data);
  return parsed.success ? parsed.data : undefined;
}

/** The only writer of the `github_stats` row: validates, then upserts under the hard-coded key. */
export async function writeStats(db: Database, raw: unknown): Promise<GithubStats> {
  const data = githubStats.parse(raw);
  await db
    .insert(content)
    .values({ key: STATS_KEY, data })
    .onConflictDoUpdate({ target: content.key, set: { data, updatedAt: new Date() } });
  return data;
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection { contributionCalendar { totalContributions } }
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false, first: 100) {
      totalCount
      nodes { primaryLanguage { name } }
    }
  }
}`;

interface StatsResponse {
  data?: {
    user?: {
      contributionsCollection: { contributionCalendar: { totalContributions: number } };
      repositories: { totalCount: number; nodes: { primaryLanguage: { name: string } | null }[] };
    };
  };
}

/** One GraphQL call; returns unvalidated stats (writeStats validates). Throws on HTTP/GraphQL errors. */
export function createGithubFetcher(token: string, now: () => number = Date.now, fetchFn: typeof fetch = fetch) {
  return async (): Promise<unknown> => {
    const response = await fetchFn('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'portfolio' },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`GitHub GraphQL ${response.status}`);
    const user = ((await response.json()) as StatsResponse).data?.user;
    if (!user) throw new Error('GitHub GraphQL returned no user');
    const counts = new Map<string, number>();
    for (const { primaryLanguage } of user.repositories.nodes)
      if (primaryLanguage) counts.set(primaryLanguage.name, (counts.get(primaryLanguage.name) ?? 0) + 1);
    return {
      contributions: user.contributionsCollection.contributionCalendar.totalContributions,
      publicRepos: user.repositories.totalCount,
      languages: [...counts]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name),
      fetchedAt: new Date(now()).toISOString(),
    };
  };
}
