# Appwrite Permission Matrix — Real-World Scenarios

---

## Complex Scenario 1: Portfolio with Public and Private Sections

A user has skills that can be:
- **Public Active**: Visible to everyone (default portfolio)
- **Draft/Hidden**: Visible only to the owner
- **Trashed**: Visible only to the owner + admin

```typescript
// SCENARIO: Skill with visibility states
async function createSkillWithVisibility(
  data: CreateSkillInput,
  visibility: 'public' | 'hidden',
  userId: string,
): Promise<Skill> {
  const permissions =
    visibility === 'public'
      ? [
          Permission.read(Role.any()),              // Everyone can see
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      : [
          Permission.read(Role.user(userId)),        // Only owner
          Permission.read(Role.team('admin')),       // + admin team
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ];

  const doc = await databases.createDocument(
    DB_ID, COLLECTIONS.SKILLS, ID.unique(), data, permissions
  );
  return SkillSchema.parse(doc);
}

// CHANGING VISIBILITY (toggle public <→ private)
async function setSkillVisibility(
  skillId: SkillId,
  visibility: 'public' | 'hidden',
  userId: string,
): Promise<void> {
  const newPermissions =
    visibility === 'public'
      ? [Permission.read(Role.any()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
      : [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))];

  await databases.updateDocument(
    DB_ID, COLLECTIONS.SKILLS, skillId,
    {}, // No data change
    newPermissions // Permission update
  );
}
```

---

## Complex Scenario 2: Admin Override — View All Documents

Admin team needs to see all documents, including private ones, for moderation.

```typescript
// Admin function using admin client — bypasses document-level permissions
export const adminGetAllSkillsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { account } = createSessionClient();
    const user = await account.get();

    // Check admin team membership first
    const { teams } = createSessionClient();
    const memberships = await teams.listMemberships();
    const isAdmin = memberships.memberships.some(m => m.teamId === 'admin');
    if (!isAdmin) throw new Error('Admin access required');

    // Use ADMIN client to bypass document permissions
    const { databases: adminDatabases } = createAdminClient();
    const result = await adminDatabases.listDocuments(
      DB_ID, COLLECTIONS.SKILLS,
      [Query.limit(500), Query.orderDesc('$createdAt')]
    );

    return result.documents.map(doc => SkillSchema.parse(doc));
  });
```

---

## Complex Scenario 3: Team Collaboration — Shared Portfolio

Two users co-managing a shared portfolio space.

```typescript
// SETUP: Create collaboration team via admin
export const createCollaborationTeamFn = createServerFn({ method: 'POST' })
  .validator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { account } = createSessionClient();
    const user = await account.get();

    const { teams } = createAdminClient();

    // Create team with owner
    const team = await teams.create(ID.unique(), data.name, ['owner', 'editor']);

    // Add current user as owner
    await teams.createMembership(
      team.$id, ['owner'],
      `${process.env.APP_URL}/invite/accept`,
      user.$id,
      undefined,
    );

    return { teamId: team.$id, teamName: team.name };
  });

// CREATE document shared with team
async function createTeamSkill(
  data: CreateSkillInput,
  userId: string,
  teamId: string,
): Promise<Skill> {
  const doc = await databases.createDocument(
    DB_ID, COLLECTIONS.SKILLS, ID.unique(), data,
    [
      Permission.read(Role.any()),               // Public read
      Permission.update(Role.team(teamId, 'editor')),  // Team editors can update
      Permission.update(Role.team(teamId, 'owner')),   // Team owners can update
      Permission.delete(Role.team(teamId, 'owner')),   // Only owners delete
    ]
  );
  return SkillSchema.parse(doc);
}
```

---

## Complex Scenario 4: Time-Limited Sharing (Share Link Pattern)

Generate a temporary share token for portfolio preview (without exposing all data).

```typescript
// Share link pattern: Create a share record with full public permissions
// The token is the document ID — knowing the ID = access

export const createShareLinkFn = createServerFn({ method: 'POST' })
  .validator(z.object({
    expiresInHours: z.number().int().min(1).max(168).default(24),
    sections: z.array(z.enum(['about', 'skills', 'metrics'])).default(['about', 'skills', 'metrics']),
  }))
  .handler(async ({ data }) => {
    const { account, databases } = createSessionClient();
    const user = await account.get();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + data.expiresInHours);

    const shareDoc = await databases.createDocument(
      DB_ID, COLLECTIONS.SHARES, ID.unique(),
      {
        userId: user.$id,
        sections: data.sections,
        expiresAt: expiresAt.toISOString(),
        viewCount: 0,
      },
      [
        Permission.read(Role.any()),              // Anyone with the doc ID can read
        Permission.update(Role.user(user.$id)),   // Owner can update settings
        Permission.delete(Role.user(user.$id)),   // Owner can revoke
      ]
    );

    return {
      shareId: shareDoc.$id,
      shareUrl: `${process.env.APP_URL}/share/${shareDoc.$id}`,
      expiresAt: shareDoc['expiresAt'],
    };
  });

// Public share viewer — reads share doc to validate, then fetches portfolio data
export const getSharedPortfolioFn = createServerFn({ method: 'GET' })
  .validator(z.object({ shareId: z.string() }))
  .handler(async ({ data }) => {
    // Use admin client — share page is public (no session)
    const { databases } = createAdminClient();

    // Get share document (public read — anyone can access)
    let shareDoc;
    try {
      shareDoc = await databases.getDocument(DB_ID, COLLECTIONS.SHARES, data.shareId);
    } catch (e) {
      if (e instanceof AppwriteException && e.code === 404) throw new Error('Share link not found');
      throw e;
    }

    // Validate expiry
    if (new Date(shareDoc['expiresAt']) < new Date()) {
      throw new Error('This share link has expired');
    }

    // Increment view count
    await databases.updateDocument(DB_ID, COLLECTIONS.SHARES, data.shareId, {
      viewCount: (shareDoc['viewCount'] as number) + 1,
    });

    // Fetch the actual portfolio data for the owner
    const sections = shareDoc['sections'] as string[];
    const portfolio: Record<string, unknown> = {};

    if (sections.includes('about')) {
      const aboutResult = await databases.listDocuments(DB_ID, COLLECTIONS.ABOUT, [
        Query.equal('userId', shareDoc['userId']),
      ]);
      portfolio.about = aboutResult.documents[0] ?? null;
    }

    if (sections.includes('skills')) {
      const skillsResult = await databases.listDocuments(DB_ID, COLLECTIONS.SKILLS, [
        Query.equal('userId', shareDoc['userId']),
        Query.equal('isActive', true),
        Query.isNull('deletedAt'),
      ]);
      portfolio.skills = skillsResult.documents;
    }

    return portfolio;
  });
```

---

## Permission Decision Matrix

| Document Type | Read | Update | Delete |
|:---|:---|:---|:---|
| Public portfolio item | `Role.any()` | `Role.user(userId)` | `Role.user(userId)` |
| Private draft | `Role.user(userId)` | `Role.user(userId)` | `Role.user(userId)` |
| Shared team document | `Role.team(teamId)` | `Role.team(teamId, 'editor')` | `Role.team(teamId, 'owner')` |
| Admin-managed content | `Role.any()` | `Role.team('admin')` | `Role.team('admin')` |
| Trash document | `Role.user(userId)` | `—` | `Role.user(userId)` |
| Share link record | `Role.any()` | `Role.user(userId)` | `Role.user(userId)` |
| Audit log entry | `Role.team('admin')` | `—` (immutable) | `—` (immutable) |
