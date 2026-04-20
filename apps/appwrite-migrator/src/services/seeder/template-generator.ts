import { blueprints } from '@repo/appwrite';
import { rowSchemaByTable, type SeedTableId } from './seeder-validator';
import type { SeedTemplate, SeedTemplateArtifacts } from '@/services/seeder';

type BlueprintTable = (typeof blueprints)[number];
type BlueprintColumn = BlueprintTable['columns'][number];

const blueprintById = new Map(blueprints.map((table) => [table.id, table]));

function cloneUniqueLogicKeys(
  source: Record<string, string[]>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(source).map(([key, values]) => [key, [...values]]),
  );
}

function resolveSampleScalarValue(
  tableId: SeedTableId,
  column: BlueprintColumn,
): string | number | boolean | null {
  if (column.default !== undefined) {
    return column.default;
  }

  switch (column.type) {
    case 'string':
      return `${tableId}_${column.key}`;
    case 'integer':
      return 0;
    case 'float':
      return 0;
    case 'boolean':
      return false;
    case 'datetime':
      return '2026-01-01T00:00:00.000Z';
    case 'email':
      return 'seed@example.com';
    case 'enum':
      return column.elements?.[0] ?? null;
    case 'url':
      return `https://example.com/${tableId}/${column.key}`;
    case 'ip':
      return '127.0.0.1';
    default:
      return null;
  }
}

function buildTemplateRow(
  tableId: SeedTableId,
  columns: BlueprintColumn[],
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  for (const column of columns) {
    const scalarValue = resolveSampleScalarValue(tableId, column);
    row[column.key] = column.array ? [scalarValue] : scalarValue;
  }

  return row;
}

function buildMarkdownSpec(template: SeedTemplate): string {
  const lines: string[] = [
    '# Seed Template Specification',
    '',
    `Generated at: ${template.generatedAt}`,
    '',
  ];

  for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
    const tableBlueprint = blueprintById.get(tableId);

    if (!tableBlueprint) {
      continue;
    }

    lines.push(`## Table \`${tableId}\``);
    lines.push('');
    lines.push('### Unique Logic Keys');

    for (const [key, values] of Object.entries(
      tableBlueprint.uniqueLogicKeys,
    )) {
      lines.push(`- ${key}: ${values.join(', ')}`);
    }

    lines.push('');
    lines.push('### Columns');
    lines.push('');
    lines.push('| key | type | required | size | default |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const column of tableBlueprint.columns) {
      const required = column.required ? 'required' : 'optional';
      const size = typeof column.size === 'number' ? String(column.size) : '-';
      const defaultValue =
        column.default !== undefined ? String(column.default) : '-';

      lines.push(
        `| ${column.key} | ${column.type} | ${required} | ${size} | ${defaultValue} |`,
      );
    }

    lines.push('');
    lines.push('### Example Row');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(template.tables[tableId].rows[0], null, 2));
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

export class TemplateGenerator {
  generateTemplateArtifacts(options?: {
    generatedAt?: string;
  }): SeedTemplateArtifacts {
    const generatedAt = options?.generatedAt ?? new Date().toISOString();
    const tables = {} as SeedTemplate['tables'];

    for (const tableId of Object.keys(rowSchemaByTable) as SeedTableId[]) {
      const tableBlueprint = blueprintById.get(tableId);

      if (!tableBlueprint) {
        tables[tableId] = {
          uniqueLogicKeys: {},
          rows: [{}],
        };
        continue;
      }

      tables[tableId] = {
        uniqueLogicKeys: cloneUniqueLogicKeys(tableBlueprint.uniqueLogicKeys),
        rows: [buildTemplateRow(tableId, tableBlueprint.columns)],
      };
    }

    const template: SeedTemplate = {
      version: 1,
      generatedAt,
      tables,
    };

    return {
      template,
      templateJson: JSON.stringify(template, null, 2),
      markdownSpec: buildMarkdownSpec(template),
    };
  }
}
