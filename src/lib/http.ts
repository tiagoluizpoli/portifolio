import { timingSafeEqual } from 'node:crypto';
import { ContentError } from './content/store';

const UNAUTHORIZED = 401;
const UNPROCESSABLE_ENTITY = 422;
const BEARER_PREFIX = /^Bearer /;

const sameToken = (given: string, expected: string) => {
  const givenBytes = Buffer.from(given);
  const expectedBytes = Buffer.from(expected);
  return givenBytes.length === expectedBytes.length && timingSafeEqual(givenBytes, expectedBytes);
};

/** Bearer token check. An unset secret disables the endpoint, it never opens it. */
export function isAuthorized(request: Request, secret: string | undefined): boolean {
  const given = request.headers.get('authorization')?.replace(BEARER_PREFIX, '') ?? '';
  return Boolean(secret) && sameToken(given, secret as string);
}

export const unauthorized = () => Response.json({ error: 'unauthorized' }, { status: UNAUTHORIZED });

/** 422 with the content path for a ContentError; anything else is rethrown. */
export function contentErrorResponse(error: unknown): Response {
  if (error instanceof ContentError)
    return Response.json({ error: error.message, path: error.path }, { status: UNPROCESSABLE_ENTITY });
  throw error;
}
