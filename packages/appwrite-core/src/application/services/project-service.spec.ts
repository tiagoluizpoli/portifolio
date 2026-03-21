import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TransactionManager } from '../../domain/services/transaction-manager.js';
import type { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository.js';
import { ProjectService } from './project-service.js';

describe('ProjectService (Compensating Transactions)', () => {
  let service: ProjectService;
  let mockRepo: { create: Mock; delete: Mock };
  let txManager: TransactionManager;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      delete: vi.fn(),
    };
    txManager = new TransactionManager();
    service = new ProjectService(
      mockRepo as unknown as PortfolioRepository,
      txManager,
    );
  });

  it('should successfully create a project when all steps pass', async () => {
    mockRepo.create.mockResolvedValue({
      id: 'proj_123',
      title: 'Test Project',
    });

    const result = await service.createProjectWithAudit('Test Project');

    expect(result.id).toBe('proj_123');
    expect(mockRepo.create).toHaveBeenCalledOnce();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('should rollback step 1 if step 2 fails', async () => {
    // Stage 1: Success
    mockRepo.create.mockResolvedValue({
      id: 'proj_fail_me_123',
      title: 'Bad Project',
    });

    // Step 2 will fail because ID contains 'fail_me' (per simulateAuditLog logic)

    await expect(service.createProjectWithAudit('Bad Project')).rejects.toThrow(
      'SIMULATED_AUDIT_FAILURE',
    );

    // Verify rollback was executed
    expect(mockRepo.delete).toHaveBeenCalledWith('proj_fail_me_123');
  });

  it('should log a FATAL error if rollback itself fails (FR-015)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRepo.create.mockResolvedValue({
      id: 'proj_fail_me_fatal',
      title: 'Killer Project',
    });
    mockRepo.delete.mockRejectedValue(
      new Error('DATABASE_OFFLINE_DURING_ROLLBACK'),
    );

    await expect(
      service.createProjectWithAudit('Killer Project'),
    ).rejects.toThrow('SIMULATED_AUDIT_FAILURE');

    // Verify fatal log
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'FATAL',
        msg: expect.stringContaining('Rollback operation failed'),
      }),
    );

    consoleSpy.mockRestore();
  });
});
