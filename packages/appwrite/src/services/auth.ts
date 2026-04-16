import { z } from 'zod';
import { getAccountClient } from '../client.js';
import { mapAppwriteError } from '../errors/appwrite-errors.js';

const sessionCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export interface SessionCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt?: string;
}

export interface IAuthService {
  createSession(input: SessionCredentials): Promise<AuthSession>;
  getCurrentUser(): Promise<unknown>;
  deleteCurrentSession(): Promise<void>;
}

export class AuthService implements IAuthService {
  private readonly account = getAccountClient();

  async createSession(input: SessionCredentials): Promise<AuthSession> {
    const credentials = sessionCredentialsSchema.parse(input);

    try {
      const session = await this.account.createEmailPasswordSession({
        email: credentials.email,
        password: credentials.password,
      });

      return {
        id: session.$id,
        userId: session.userId,
        expiresAt: session.expire,
      };
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async getCurrentUser(): Promise<unknown> {
    try {
      return await this.account.get();
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }

  async deleteCurrentSession(): Promise<void> {
    try {
      await this.account.deleteSession({ sessionId: 'current' });
    } catch (error) {
      throw mapAppwriteError(error);
    }
  }
}
