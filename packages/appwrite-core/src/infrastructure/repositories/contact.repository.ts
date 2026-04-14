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
        // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast for TablesDB rows
        const data = row as any;
        if (data.type === 'Email') result.email = data.value;
        if (data.type === 'WhatsApp') result.phone = data.value;
        if (data.type === 'Location') result.location = data.value;
      }

      result.socials = socialsResponse.rows.map((row) => {
        // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast for TablesDB rows
        const data = row as any;
        return {
          id: data.$id,
          platformId: data.platformId as string,
          username: data.username as string,
          iconId: data.iconCode as string,
          active: data.status === 'active',
          sort: data.sort || 0,
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
      const coreMappings = [
        { type: 'Email', value: data.email, sid: `contact-email-${locale}` },
        {
          type: 'WhatsApp',
          value: data.phone,
          sid: `contact-whatsapp-${locale}`,
        },
        {
          type: 'Location',
          value: data.location,
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
              locale,
            },
          });
        } catch {
          // Create if not exists
          await this.tables.createRow({
            databaseId: this.databaseId,
            tableId: this.tableId,
            rowId: mapping.sid,
            data: {
              type: mapping.type,
              value: mapping.value,
              locale,
            },
          });
        }
      }

      // 2. Sync Socials (Delete & Re-create for simplicity since they are shared rows)
      // NOTE: Shared across locales per FR-011.
      const existingSocials = await this.tables.listRows({
        databaseId: this.databaseId,
        tableId: this.socialsTableId,
      });

      for (const row of existingSocials.rows) {
        await this.tables.deleteRow({
          databaseId: this.databaseId,
          tableId: this.socialsTableId,
          rowId: row.$id,
        });
      }

      for (const social of data.socials) {
        await this.tables.createRow({
          databaseId: this.databaseId,
          tableId: this.socialsTableId,
          rowId: ID.unique(),
          data: {
            platformId: social.platformId,
            username: social.username,
            iconCode: social.iconId,
            status: social.active ? 'active' : 'inactive',
            sort: social.sort,
          },
        });
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
    // biome-ignore lint/suspicious/noExplicitAny: infrastructure-level cast
    const data = doc as any;
    return {
      id: doc.$id,
      locale: data.locale || '',
      email: data.type === 'Email' ? data.value : '',
      phone: data.type === 'WhatsApp' ? data.value : '',
      location: data.type === 'Location' ? data.value : '',
      socials: [],
    };
  }
}
