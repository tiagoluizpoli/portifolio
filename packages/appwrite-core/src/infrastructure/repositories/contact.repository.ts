import { type Client, ID, type Models, Query } from 'node-appwrite';
import type { ContactData } from '../../domain/cms/chapters/contact.js';
import type { IContactRepository } from '../../domain/repositories/interfaces.js';
import { AppWriteRepository } from './appwrite.repository.js';

/**
 * ContactRepository (Constitution §XVII, §I)
 * Dual-table aggregator for 'contact_info' (key-value) and 'socials'.
 */
export class ContactRepository
  extends AppWriteRepository<ContactData>
  implements IContactRepository
{
  private socialsTableId = 'socials';

  private static readonly CONTACT_ICON_BY_TYPE = {
    Email: 'lucide:mail',
    WhatsApp: 'lucide:phone',
    Location: 'lucide:map-pin',
  } as const;

  constructor(client: Client, databaseId: string) {
    // Primary table for core channels
    super(client, databaseId, 'contact_info');
  }

  async getByLocale(locale: string): Promise<ContactData | null> {
    try {
      // 1. Fetch contact info rows
      const infoResponse = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [Query.equal('locale', locale)],
      });

      // 2. Fetch socials (shared)
      const socialsResponse = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.socialsTableId,
      });

      if (infoResponse.total === 0 && socialsResponse.total === 0) return null;

      // 3. Aggregate mapping
      const result: ContactData = {
        id: locale, // Placeholder ID based on locale
        locale,
        email: '',
        phone: '',
        location: '',
        socials: [],
      };

      for (const row of infoResponse.rows) {
        const rowData = this.asRecord(row);
        const type = this.readString(rowData, 'type');
        const value = this.readString(rowData, 'value');

        if (type === 'Email') result.email = value;
        if (type === 'WhatsApp') result.phone = value;
        if (type === 'Location') result.location = value;
      }

      result.socials = socialsResponse.rows.map((row) => {
        const rowData = this.asRecord(row);
        return {
          id: this.readString(rowData, '$id'),
          platformId: this.readString(rowData, 'platformId'),
          username: this.readString(rowData, 'username'),
          iconId: this.readString(rowData, 'iconCode'),
          active: this.readString(rowData, 'status') === 'active',
          sort: this.readNumber(rowData, 'sort'),
        };
      });

      return result;
    } catch (error: unknown) {
      this.handleError(error);
      return null;
    }
  }

  async updateByLocale(
    locale: string,
    data: Omit<ContactData, 'id'>,
  ): Promise<ContactData> {
    try {
      // 1. Sync contact_info rows (Upsert pattern)
      const coreMappings: Array<{
        type: 'Email' | 'WhatsApp' | 'Location';
        value: string;
        sort: number;
        sid: string;
      }> = [
        {
          type: 'Email',
          value: data.email,
          sort: 0,
          sid: `contact-email-${locale}`,
        },
        {
          type: 'WhatsApp',
          value: data.phone,
          sort: 1,
          sid: `contact-whatsapp-${locale}`,
        },
        {
          type: 'Location',
          value: data.location,
          sort: 2,
          sid: `contact-location-${locale}`,
        },
      ];

      for (const mapping of coreMappings) {
        try {
          await this.tables.updateRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: mapping.sid,
            data: {
              type: mapping.type,
              value: mapping.value,
              iconCode: ContactRepository.CONTACT_ICON_BY_TYPE[mapping.type],
              sort: mapping.sort,
              locale,
            },
          });
        } catch (error: unknown) {
          if (!this.isNotFoundError(error)) {
            throw error;
          }

          // Create if not exists
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: mapping.sid,
            data: {
              type: mapping.type,
              value: mapping.value,
              iconCode: ContactRepository.CONTACT_ICON_BY_TYPE[mapping.type],
              sort: mapping.sort,
              locale,
            },
          });
        }
      }

      // 2. Sync Socials (diff-based upsert; shared across locales per FR-011).
      const existingSocials = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.socialsTableId,
      });

      const existingById = new Map(
        existingSocials.rows.map((row) => [row.$id, row]),
      );
      const keptRowIds = new Set<string>();

      for (const social of data.socials) {
        const resolvedIconCode = this.resolveSocialIconCode(social);
        const rowData = {
          platformId: social.platformId,
          username: social.username,
          iconCode: resolvedIconCode,
          status: social.active ? 'active' : 'inactive',
          sort: social.sort,
        };

        if (social.id && existingById.has(social.id)) {
          keptRowIds.add(social.id);
          await this.tables.updateRow({
            databaseId: this.databaseId,
            tableId: this.socialsTableId,
            rowId: social.id,
            data: rowData,
          });
          continue;
        }

        await this.tables.createRow({
          databaseId: this.databaseId,
          tableId: this.socialsTableId,
          rowId: ID.unique(),
          data: rowData,
        });
      }

      for (const row of existingSocials.rows) {
        if (!keptRowIds.has(row.$id)) {
          await this.tables.deleteRow({
            databaseId: this.databaseId,
            tableId: this.socialsTableId,
            rowId: row.$id,
          });
        }
      }

      return { id: locale, ...data };
    } catch (error: unknown) {
      this.handleError(error);
      throw error;
    }
  }
  /**
   * mapToModel
   * Implemented to satisfy AppWriteRepository abstract member.
   * Note: ContactData is an aggregate, so this method is mostly a fallback.
   */
  protected mapToModel(doc: Models.Document): ContactData {
    const data = this.asRecord(doc);
    const type = this.readString(data, 'type');
    const value = this.readString(data, 'value');

    return {
      id: this.readString(data, '$id'),
      locale: this.readString(data, 'locale'),
      email: type === 'Email' ? value : '',
      phone: type === 'WhatsApp' ? value : '',
      location: type === 'Location' ? value : '',
      socials: [],
    };
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    const code = (error as { code?: number }).code;
    if (code === 404) {
      return true;
    }

    const lowered = error.message.toLowerCase();
    return lowered.includes('not found') || lowered.includes('row_not_found');
  }

  private resolveSocialIconCode(
    social: ContactData['socials'][number],
  ): string {
    const legacyIconCode =
      'iconCode' in social && typeof social.iconCode === 'string'
        ? social.iconCode
        : undefined;

    return social.iconId || legacyIconCode || 'lucide:link';
  }

  private asRecord(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>;
    }
    return {};
  }

  private readString(record: Record<string, unknown>, key: string): string {
    const value = record[key];
    return typeof value === 'string' ? value : '';
  }

  private readNumber(record: Record<string, unknown>, key: string): number {
    const value = record[key];
    return typeof value === 'number' ? value : 0;
  }
}
