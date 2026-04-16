export interface AppwriteSystemFields {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

export interface DomainSystemFields {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
}

export const DocumentMapper = {
  toDomain<T extends Record<string, unknown>>(
    input: AppwriteSystemFields & Record<string, unknown>,
  ): T {
    const { $id, $createdAt, $updatedAt, $permissions, ...rest } = input;

    return {
      ...rest,
      ...(typeof $id === 'string' ? { id: $id } : {}),
      ...(typeof $createdAt === 'string' ? { createdAt: $createdAt } : {}),
      ...(typeof $updatedAt === 'string' ? { updatedAt: $updatedAt } : {}),
      ...(Array.isArray($permissions) ? { permissions: $permissions } : {}),
    } as T;
  },

  toAppwrite<T extends Record<string, unknown>>(
    input: T & DomainSystemFields,
  ): Record<string, unknown> {
    const { id, createdAt, updatedAt, permissions, ...rest } = input;
    void id;
    void createdAt;
    void updatedAt;
    void permissions;

    return rest;
  },
};
