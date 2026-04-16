import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactData } from '../../domain/cms/chapters/contact.js';
import { ContactRepository } from './contact.repository.js';

type TablesMock = {
  listRows: ReturnType<typeof vi.fn>;
  updateRow: ReturnType<typeof vi.fn>;
  createRow: ReturnType<typeof vi.fn>;
  deleteRow: ReturnType<typeof vi.fn>;
};

function makeTablesMock(): TablesMock {
  return {
    listRows: vi.fn(),
    updateRow: vi.fn(),
    createRow: vi.fn(),
    deleteRow: vi.fn(),
  };
}

describe('ContactRepository.updateByLocale', () => {
  let tables: TablesMock;
  let repository: ContactRepository;

  beforeEach(() => {
    tables = makeTablesMock();
    repository = new ContactRepository({} as never, 'db-test');
    (repository as unknown as { tables: TablesMock }).tables = tables;

    tables.listRows.mockResolvedValue({ rows: [], total: 0 });
    tables.updateRow.mockResolvedValue({});
    tables.createRow.mockResolvedValue({});
    tables.deleteRow.mockResolvedValue(undefined);
  });

  it('should include required iconCode and sort for contact_info upserts', async () => {
    const payload: Omit<ContactData, 'id'> = {
      locale: 'en',
      email: 'hello@example.com',
      phone: '+5511999999999',
      location: 'Sao Paulo',
      socials: [],
    };

    await repository.updateByLocale('en', payload);

    expect(tables.updateRow).toHaveBeenCalledTimes(3);

    expect(tables.updateRow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        rowId: 'contact-email-en',
        data: expect.objectContaining({
          type: 'Email',
          iconCode: 'lucide:mail',
          sort: 0,
          locale: 'en',
        }),
      }),
    );

    expect(tables.updateRow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        rowId: 'contact-whatsapp-en',
        data: expect.objectContaining({
          type: 'WhatsApp',
          iconCode: 'lucide:phone',
          sort: 1,
          locale: 'en',
        }),
      }),
    );

    expect(tables.updateRow).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        rowId: 'contact-location-en',
        data: expect.objectContaining({
          type: 'Location',
          iconCode: 'lucide:map-pin',
          sort: 2,
          locale: 'en',
        }),
      }),
    );
  });

  it('should create row only when update fails with not-found and rethrow other errors', async () => {
    const notFoundError = Object.assign(new Error('row not found'), {
      code: 404,
    });
    const upstreamError = Object.assign(new Error('upstream failure'), {
      code: 500,
    });

    tables.updateRow
      .mockRejectedValueOnce(notFoundError)
      .mockRejectedValueOnce(upstreamError);

    const payload: Omit<ContactData, 'id'> = {
      locale: 'en',
      email: 'hello@example.com',
      phone: '+5511999999999',
      location: 'Sao Paulo',
      socials: [],
    };

    await expect(
      repository.updateByLocale('en', payload),
    ).rejects.toMatchObject({ code: 500 });

    expect(tables.createRow).toHaveBeenCalledTimes(1);
    expect(tables.createRow).toHaveBeenCalledWith(
      expect.objectContaining({
        rowId: 'contact-email-en',
        data: expect.objectContaining({
          type: 'Email',
          iconCode: 'lucide:mail',
          sort: 0,
        }),
      }),
    );
  });

  it('should sync socials by diff and resolve iconCode from legacy payload', async () => {
    tables.listRows.mockResolvedValue({
      rows: [
        {
          $id: 'soc-existing',
          platformId: 'github',
          username: 'old-user',
          iconCode: 'lucide:github',
          status: 'active',
          sort: 0,
        },
        {
          $id: 'soc-stale',
          platformId: 'linkedin',
          username: 'stale-user',
          iconCode: 'lucide:linkedin',
          status: 'active',
          sort: 1,
        },
      ],
      total: 2,
    });

    const payload = {
      locale: 'en',
      email: 'hello@example.com',
      phone: '+5511999999999',
      location: 'Sao Paulo',
      socials: [
        {
          id: 'soc-existing',
          platformId: 'github',
          username: 'new-user',
          iconId: '',
          iconCode: 'fa6-brands:github',
          active: true,
          sort: 0,
        },
        {
          id: 'new-id-not-persisted',
          platformId: 'website',
          username: 'https://example.com',
          iconId: 'lucide:link',
          active: true,
          sort: 2,
        },
      ],
    } as unknown as Omit<ContactData, 'id'>;

    await repository.updateByLocale('en', payload);

    expect(tables.updateRow).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: 'socials',
        rowId: 'soc-existing',
        data: expect.objectContaining({
          username: 'new-user',
          iconCode: 'fa6-brands:github',
        }),
      }),
    );

    expect(tables.createRow).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: 'socials',
        data: expect.objectContaining({
          platformId: 'website',
          iconCode: 'lucide:link',
        }),
      }),
    );

    expect(tables.deleteRow).toHaveBeenCalledTimes(1);
    expect(tables.deleteRow).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: 'socials',
        rowId: 'soc-stale',
      }),
    );
  });
});
