import type { MigrationStructuralDelta } from '@repo/appwrite';

export class PendingStructuralChangesError extends Error {
  readonly delta: MigrationStructuralDelta;

  constructor(delta: MigrationStructuralDelta) {
    super('Audit check failed: pending structural changes detected.');
    this.name = 'PendingStructuralChangesError';
    this.delta = delta;
  }
}

export class ConflictingMigratorCliFlagsError extends Error {
  constructor(flags: string[]) {
    super(
      `Conflicting migrator mode flags provided: ${flags.join(', ')}. Use only one of: --check, --migrate, --seed, --template.`,
    );
    this.name = 'ConflictingMigratorCliFlagsError';
  }
}

export class MissingTemplateOutputPathError extends Error {
  constructor() {
    super(
      'Missing value for --template-output. Provide a path, for example: --template-output=./seed-template.json',
    );
    this.name = 'MissingTemplateOutputPathError';
  }
}
