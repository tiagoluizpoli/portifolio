import type { Portfolio } from '../../domain/repositories/interfaces.js';
import type { TransactionManager } from '../../domain/services/transaction-manager.js';
import type { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository.js';

export class ProjectService {
  constructor(
    private portfolioRepo: PortfolioRepository,
    private txManager: TransactionManager,
  ) {}

  /**
   * Creates a portfolio project and logs an initial audit record.
   * Demonstrates FR-015 Compensating Transactions.
   */
  async createProjectWithAudit(
    title: string,
    description?: string,
  ): Promise<Portfolio> {
    try {
      // Step 1: Create the project
      const project = await this.portfolioRepo.create({ title, description });

      // Register ROLLBACK for Step 1
      this.txManager.add(async () => {
        console.log(
          `[Rollback] Deleting project ${project.id} due to subsequent failure...`,
        );
        await this.portfolioRepo.delete(project.id);
      });

      // Step 2: Simulate another operation (e.g. Audit Log or Permission Grant)
      // For this demonstration, we'll just simulate a potential failure
      await this.simulateAuditLog(project.id);

      // If all steps succeed
      this.txManager.commit();
      return project;
    } catch (error) {
      // Orchestrate the rollbacks
      await this.txManager.rollback();
      throw error;
    }
  }

  private async simulateAuditLog(projectId: string): Promise<void> {
    // In a real scenario, this would call another repository
    console.log(`[Audit] Logging project creation for ${projectId}`);

    // Simulate failure for specific titles to test rollbacks in units
    if (projectId.includes('fail_me')) {
      throw new Error('SIMULATED_AUDIT_FAILURE');
    }
  }
}
